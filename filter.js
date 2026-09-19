// ============================================================
// filter.js — タイムライン非表示フィルター（完全ローカル・API不使用）
// ============================================================
// 読み込み順: filters.js（単語データ）→ filter.js（判定エンジン）→ content.js（UI/演出）
//
// 方針:
//   - 外部API（従量課金・ネットワーク送信）は一切使わない。公開リポジトリに
//     キーやエンドポイントを含めない。判定はすべてローカルの正規表現で完結する。
//   - For You / Following だけでなく、検索・プロフィール・リスト・ブックマーク・
//     通知・探索など、ツイートが並ぶ画面すべてで動作する。
//   - ステータス詳細画面では、その画面の主役（親ツイート）だけは残す。
//     （返信はフィルタ対象）
//
// 公開API: window.X2TFilter
//   configure({filter,hideGov,hideNews,hideFin,hideInsult,hideDisaster,hideFood,hideAiHype,art,gentle,strength})
//   refreshHandle()  ログイン中ハンドルを再取得
//   apply(root)      追加された部分木／記事を判定
//   refilter()       全画面を再判定
//   restore()        非表示を解除
(() => {
  "use strict";

  const TWEET_SELECTOR = 'article[data-testid="tweet"]';

  // フィルター関連の設定（他モジュールの設定は content.js が持つ）
  const settings = {
    filterOn: false,
    hideGov: false,
    hideNews: false,
    hideFin: false,
    hideInsult: false,
    hideDisaster: true,
    hideFood: true,
    hideAiHype: true,
    art: false,
    gentle: true,
  };

  let myHandle = null;
  const hiddenTweets = new Set();

  // ===== ツイート情報の取得 =====

  function getTweetHandle(art) {
    const name = art.querySelector('[data-testid="User-Name"]');
    if (!name) return null;
    const a = name.querySelector('a[href^="/"]');
    if (!a) return null;
    const m = (a.getAttribute("href") || "").match(/^\/([A-Za-z0-9_]{1,15})$/);
    return m ? m[1].toLowerCase() : null;
  }

  function getTweetDisplayName(art) {
    const name = art.querySelector('[data-testid="User-Name"]');
    return name ? (name.textContent || "") : "";
  }

  // ログイン中の自分のハンドル（プロフィールタブ／アカウント切替から）
  function getMyHandle() {
    const profile = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
    if (profile) {
      const m = (profile.getAttribute("href") || "").match(/^\/([A-Za-z0-9_]{1,15})$/);
      if (m) return m[1].toLowerCase();
    }
    const btn = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');
    if (btn) {
      const m = (btn.textContent || "").match(/@([A-Za-z0-9_]{1,15})/);
      if (m) return m[1].toLowerCase();
    }
    return null;
  }

  function isOwnTweet(art) {
    return !!myHandle && getTweetHandle(art) === myHandle;
  }

  function isJapaneseMedia(art) {
    const handle = getTweetHandle(art);
    if (handle && JP_MEDIA_HANDLES.has(handle)) return true;
    return JP_MEDIA_NAME.test(getTweetDisplayName(art));
  }

  // メディアはネガティブフィルターの対象外。ただし被害状況（死者・遺体・重体など
  // 感情に強い衝撃を与える表現）は非表示を維持する。
  function isJapaneseMediaExempt(art) {
    if (!isJapaneseMedia(art)) return false;
    if (DISASTER_EMOTIONAL_BLOCK.test(art.textContent || "")) return false;
    return true;
  }

  // ===== 判定 =====
  // カテゴリ分類は filters.js の純粋関数 x2tCategories() を共有する
  // （selfcheck.js の自己診断と同じロジック＝判定の食い違いが起きない）。

  // ツイート本文テキスト（短いほど「テキスト控えめ」）
  function getTweetText(art) {
    const t = art.querySelector('[data-testid="tweetText"]');
    return t ? (t.textContent || "").trim() : "";
  }

  // いいね/リツイート数（aria-label の「12.3K Likes」等から集計）
  function parseCount(s) {
    s = (s || "").replace(/,/g, "").trim();
    const m = s.match(/^([\d.]+)\s*([KMB])?$/i);
    if (!m) return 0;
    const mult = { K: 1e3, M: 1e6, B: 1e9 };
    return parseFloat(m[1]) * (m[2] ? mult[m[2].toUpperCase()] : 1);
  }
  function getEngagement(art) {
    let total = 0;
    for (const sel of ['[data-testid="retweet"]', '[data-testid="like"]']) {
      const el = art.querySelector(sel);
      if (!el) continue;
      const label = el.getAttribute("aria-label") || el.textContent || "";
      const m = label.match(/([\d.,KMB]+)/i);
      if (m) total += parseCount(m[1]);
    }
    return total;
  }

  // アート集中モードの対象か（画像 or アート語 + いいね/RT + テキスト控えめ）
  function isArtPost(art) {
    const hasImage = !!art.querySelector('[data-testid="tweetPhoto"], img[src*="/media/"]');
    const hasArtKeyword = ART_ALLOW.test(art.textContent || "");
    if (!hasImage && !hasArtKeyword) return false;
    if (getTweetText(art).length > 200) return false;
    return getEngagement(art) >= 5;
  }

  // 非表示にするべきか（自分の投稿は常に除外）
  function computeHide(art) {
    if (isOwnTweet(art)) return false;

    const author = getTweetHandle(art);
    if (author) {
      if (settings.hideGov && GOV_ACCOUNTS.has(author)) return true;
      if (settings.hideNews && NEWS_ACCOUNTS.has(author)) return true;
      if (settings.hideFin && FIN_ACCOUNTS.has(author)) return true;
    }

    const t = art.textContent || "";
    if (settings.hideInsult && INSULT_STRONG.test(t)) return true;

    if (settings.art) return !isArtPost(art);

    const cats = x2tCategories(t);
    if (settings.hideDisaster && cats.disaster) return true;
    if (settings.hideFood && cats.gourmet) return true;
    if (settings.hideAiHype && cats.aiHype) return true;
    if (settings.filterOn && cats.negative) {
      if (isJapaneseMediaExempt(art)) return false;
      return true;
    }
    return false;
  }

  function applyArticle(art) {
    if (!art || art.tagName !== "ARTICLE") return;
    const hide = computeHide(art);
    if (hide) {
      hiddenTweets.add(art);
      art.style.display = "none";
    } else {
      hiddenTweets.delete(art);
      if (art.style.display === "none") art.style.display = "";
    }
    gentleMark(art, hide);
  }

  // ===== 優しいTwitter 2：DoomScrolling回避 =====
  // 悪い投稿が連続したら、動物写真などの「優しい投稿」に辿り着くまで
  // フィードを少しずつ送ってスキップする。回数・間隔を制限し、いつでも停止可能。
  const GENTLE_THRESHOLD = 6;      // 連続して隠れた投稿数
  const GENTLE_NUDGES = 4;         // 1回の起動で送る回数
  const GENTLE_COOLDOWN = 12000;   // 起動間隔(ms)
  const gentle = {
    hiddenRun: 0,
    active: false,
    nudgesLeft: 0,
    lastEnd: 0,
    timer: null,
    seen: new WeakSet(),
  };

  function gentleLang() {
    try {
      const l = (navigator.language || "en").toLowerCase();
      return l.startsWith("ja") ? "ja" : "en";
    } catch (e) { return "en"; }
  }
  const GENTLE_MSG = {
    ja: { searching: "🐾 優しい投稿を探しています…", stop: "やめる", found: "🐦 優しい投稿を見つけたよ", rest: "🐦 少し休憩しよう" },
    en: { searching: "🐾 Looking for gentle posts…", stop: "Stop", found: "🐦 Found a gentle post", rest: "🐦 Let's take a break" },
  };

  function ensureGentleUI() {
    let el = document.getElementById("x2t-gentle");
    if (el) return el;
    const style = document.createElement("style");
    style.textContent = `
      #x2t-gentle {
        position: fixed; left: 50%; bottom: 22px;
        transform: translateX(-50%) translateY(8px);
        z-index: 2147483000; display: flex; align-items: center; gap: 10px;
        padding: 9px 14px; border-radius: 999px;
        background: linear-gradient(135deg, #1DA1F2, #0d8bdb);
        color: #fff; font-size: 12.5px; font-weight: 600;
        box-shadow: 0 8px 24px rgba(15,20,25,.25);
        opacity: 0; transition: opacity .25s ease, transform .25s ease;
        pointer-events: none; font-family: inherit;
      }
      #x2t-gentle.on { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
      #x2t-gentle button {
        border: none; background: rgba(255,255,255,.22); color: #fff;
        border-radius: 999px; padding: 3px 10px; font-size: 11px;
        font-weight: 700; cursor: pointer;
      }
      #x2t-gentle button:hover { background: rgba(255,255,255,.34); }
    `;
    document.head.appendChild(style);
    el = document.createElement("div");
    el.id = "x2t-gentle";
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `<span class="msg"></span><button type="button"></button>`;
    el.querySelector("button").addEventListener("click", gentleStop);
    document.body.appendChild(el);
    return el;
  }

  function showGentleBanner(state) {
    const m = GENTLE_MSG[gentleLang()] || GENTLE_MSG.en;
    const el = ensureGentleUI();
    el.querySelector(".msg").textContent = m[state] || m.searching;
    el.querySelector("button").textContent = m.stop;
    // 探索中のみ停止ボタン、完了メッセージでは隠す
    el.querySelector("button").style.display = state === "searching" ? "" : "none";
    el.classList.add("on");
  }
  function hideGentleBanner() {
    const el = document.getElementById("x2t-gentle");
    if (el) el.classList.remove("on");
  }
  function clearGentleTimer() {
    if (gentle.timer) { clearTimeout(gentle.timer); gentle.timer = null; }
  }

  function gentleStep() {
    if (!gentle.active) return;
    const sc = document.scrollingElement || document.documentElement;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const before = sc.scrollTop;
    const step = Math.round((window.innerHeight || 800) * 0.85);
    sc.scrollTo({ top: before + step, behavior: reduce ? "auto" : "smooth" });
    gentle.timer = setTimeout(() => {
      if (gentle.active && Math.abs(sc.scrollTop - before) < 4) sc.scrollTop = before + step;
    }, 450);
    gentle.nudgesLeft--;
    if (gentle.nudgesLeft > 0) {
      gentle.timer = setTimeout(gentleStep, 1600);
    } else {
      gentle.timer = setTimeout(() => gentleEnd(false), 1800);
    }
  }

  function gentleStart() {
    gentle.active = true;
    gentle.nudgesLeft = GENTLE_NUDGES;
    showGentleBanner("searching");
    gentleStep();
  }

  function gentleStop() {
    clearGentleTimer();
    gentle.active = false;
    gentle.hiddenRun = 0;
    gentle.lastEnd = Date.now();
    hideGentleBanner();
  }

  function gentleEnd(foundAnimal) {
    if (!gentle.active) return;
    clearGentleTimer();
    gentle.active = false;
    gentle.hiddenRun = 0;
    gentle.lastEnd = Date.now();
    showGentleBanner(foundAnimal ? "found" : "rest");
    gentle.timer = setTimeout(hideGentleBanner, foundAnimal ? 2200 : 2600);
  }

  // 各記事の初回判定だけを数え、悪い投稿が続いたら「優しいモード」を起動する
  function gentleMark(art, hide) {
    if (!settings.gentle) return;
    if (gentle.seen.has(art)) return;
    gentle.seen.add(art);
    if (hide) {
      gentle.hiddenRun++;
      if (!gentle.active && gentle.hiddenRun >= GENTLE_THRESHOLD &&
          Date.now() - gentle.lastEnd > GENTLE_COOLDOWN) {
        gentleStart();
      }
    } else {
      gentle.hiddenRun = 0;
      if (gentle.active) gentleEnd(x2tIsAnimal(art.textContent || ""));
    }
  }

  // ===== ページスコープ =====

  function isActive() {
    return settings.filterOn || settings.hideGov || settings.hideNews || settings.hideFin ||
      settings.hideInsult || settings.art || settings.hideDisaster || settings.hideFood ||
      settings.hideAiHype;
  }

  // ステータス詳細画面の「親ツイート」は画面の主役なので残す。
  // primaryColumn 内で最初に現れる記事＝親ツイート。
  function getFocalStatusArticle() {
    if (!/\/status\//.test(location.pathname)) return null;
    const col = document.querySelector('[data-testid="primaryColumn"]');
    return col ? col.querySelector(TWEET_SELECTOR) : null;
  }

  // どの画面でもフィルタする（For You / Following / 検索 / プロフィール /
  // リスト / ブックマーク / 探索 / 通知 など）。ステータス詳細の親ツイートのみ除外。
  function apply(root) {
    if (!isActive() || !root) return;
    const focal = getFocalStatusArticle();

    if (root.nodeType === Node.ELEMENT_NODE &&
        root.matches && root.matches(TWEET_SELECTOR)) {
      if (root !== focal) applyArticle(root);
      return;
    }
    const scope = root.querySelectorAll ? root : null;
    if (!scope) return;
    const articles = scope.querySelectorAll(TWEET_SELECTOR);
    for (const art of articles) {
      if (art !== focal) applyArticle(art);
    }
  }

  function restore() {
    for (const el of hiddenTweets) el.style.display = "";
    hiddenTweets.clear();
  }

  function refilter() {
    restore();
    if (isActive()) apply(document);
  }

  // ===== 設定 =====

  const BOOL_KEYS = [
    "filterOn", "hideGov", "hideNews", "hideFin", "hideInsult",
    "hideDisaster", "hideFood", "hideAiHype", "art", "gentle",
  ];

  let currentStrength = "standard";

  // 部分更新。フィルター関連が1つでも変われば再判定する。
  function configure(next) {
    if (!next) return;
    let changed = false;

    if (typeof next.strength === "string" && next.strength !== currentStrength) {
      currentStrength = next.strength;
      x2tSetStrength(currentStrength);
      changed = true;
    }

    for (const k of BOOL_KEYS) {
      if (k in next) {
        const v = !!next[k];
        if (settings[k] !== v) {
          settings[k] = v;
          changed = true;
        }
      }
    }
    if (!settings.gentle && gentle.active) gentleStop();
    if (changed) refilter();
  }

  function getStrength() {
    return currentStrength;
  }

  // デバッグ／自己診断用の状態スナップショット
  function getState() {
    return {
      strength: currentStrength,
      gentle: {
        on: settings.gentle,
        active: gentle.active,
        hiddenRun: gentle.hiddenRun,
        nudgesLeft: gentle.nudgesLeft,
      },
    };
  }

  function refreshHandle() {
    myHandle = getMyHandle();
  }

  globalThis.X2TFilter = { configure, refreshHandle, apply, refilter, restore, isActive, getStrength, getState };
})();
