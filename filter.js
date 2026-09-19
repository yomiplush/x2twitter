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
//   configure({filter,hideGov,hideNews,hideFin,hideInsult,hideDisaster,hideFood,hideAiHype,art})
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
    if (computeHide(art)) {
      hiddenTweets.add(art);
      art.style.display = "none";
    } else {
      hiddenTweets.delete(art);
      if (art.style.display === "none") art.style.display = "";
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
    "hideDisaster", "hideFood", "hideAiHype", "art",
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
    if (changed) refilter();
  }

  function getStrength() {
    return currentStrength;
  }

  function refreshHandle() {
    myHandle = getMyHandle();
  }

  globalThis.X2TFilter = { configure, refreshHandle, apply, refilter, restore, isActive, getStrength };
})();
