(() => {
  const BIRD_PATH = "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z";
  const BIRD_SVG_DATA = "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DA1F2" d="${BIRD_PATH}"/></svg>`
  );

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE"]);

  // ===== ブランド置換（X → Twitter 2）=====
  function hasX(text) {
    return /\bX\b|\u{1D54F}/u.test(text || "");
  }
  function rebrandText(text) {
    return String(text)
      .replace(/x\.com/gi, "twitter.com")
      .replace(/\u{1D54F}/gu, "Twitter 2")
      .replace(/\bX\b/g, "Twitter 2");
  }
  function fixLabel(el, attr) {
    const val = el.getAttribute(attr);
    if (val && hasX(val)) el.setAttribute(attr, rebrandText(val));
  }

  // ===== ネガティブ判定ワード（強/弱シグナル＋例外）=====
  const EN = w => `\\b${w}\\b`;
  const STRONG_JP = [
    "政治", "国際政治", "世界政治", "国政", "政局", "総理", "首相", "選挙", "国会", "衆議院", "参議院",
    "自民党", "立憲民主党", "国民民主党", "共産党", "日本維新", "公明党", "与党", "野党", "政権",
    "内閣", "閣僚", "大臣", "法案", "予算案", "解散", "増税", "減税", "消費税", "防衛費",
    "支持率", "不支持率", "党首", "代表選", "官房長官", "首脳会談", "閣僚会談", "党首会談",
    "岸田", "石破", "安倍", "菅", "河野", "高市", "小泉", "玉木", "馬場", "野田", "泉",
    "知事選", "衆院選", "参院選", "衆院", "参院", "地方選", "投開票", "開票", "投票率",
    "争点", "街頭演説", "政見", "補正予算", "政権交代", "デモ", "抗議", "ストライキ",
    "スキャンダル", "汚職", "贈収賄", "脱税", "偽造", "横領", "背任", "インサイダー",
    "陰謀論", "ワクチン", "反ワク", "デマ", "フェイク", "捏造", "隠蔽", "メディア支配",
    "情報操作", "プロパガンダ", "グレートリセット", "世界新秩序", "Qアノン", "マイクロチップ",
    "戦争", "戦闘", "侵攻", "攻撃", "ミサイル", "爆撃", "空爆", "砲撃", "報復", "ドローン",
    "軍事", "兵士", "部隊", "紛争", "停戦", "ウクライナ", "ロシア", "プーチン", "ガザ",
    "パレスチナ", "イスラエル", "ハマス", "ヒズボラ", "イラン", "北朝鮮", "核実験",
    "自衛隊", "戦線", "前線", "戦場", "占領", "侵略", "テロ", "テロリスト",
    "習近平", "金正恩", "ネタニヤフ", "ゼレンスキー", "マクロン", "モディ", "エルドアン",
    "中国共産党", "火災", "火事", "出火", "焼失", "炎上", "爆発", "爆発物",
    "交通事故", "事故死", "死亡事故", "人身事故", "事故", "衝突", "追突", "転落", "崩落", "墜落",
    "死亡", "死者", "亡くなり", "亡くなった", "逝去", "訃報", "死傷者", "負傷", "重体",
    "重症", "重傷", "けが", "怪我", "行方不明", "失踪", "自殺", "自殺未遂", "殺人", "殺害",
    "事件", "犯罪", "強盗", "詐欺", "窃盗", "盗難", "密輸", "麻薬", "人身売買",
    "逮捕", "勾留", "起訴", "判決", "懲役", "冤罪", "暴力", "暴行", "虐待",
    "性犯罪", "性暴力", "強制わいせつ", "痴漢", "誘拐", "監禁", "脅迫", "恐喝",
    "サイバー攻撃", "ハッキング", "フィッシング", "銃", "銃撃", "発砲", "刃物", "刺傷", "刺殺",
    "いがみ合い", "いがみあい", "対立", "争い", "喧嘩", "口論", "誹謗中傷", "中傷", "罵倒",
    "侮辱", "嘲笑", "叩き", "大炎上", "敵対", "反目", "内紛", "派閥争い", "分裂",
    "いじめ", "嫌がらせ", "セクハラ", "パワハラ", "モラハラ",
    "犠牲", "悲報", "悲劇", "哀悼", "追悼", "遺体", "遺族", "心肺停止", "救急搬送",
    "津波", "地震", "震災", "台風", "豪雨", "大雨", "記録的豪雨", "河川氾濫", "高潮",
    "洪水", "土砂災害", "地滑り", "噴火", "火山噴火", "竜巻", "大雪", "熱波", "寒波",
    "停電", "断水", "コロナ", "感染者", "感染拡大", "避難指示", "避難所",
    "倒産", "解雇", "リストラ", "不況", "不景気", "物価高", "円安",
    "食中毒", "熱中症", "猛暑", "鳥インフル", "インフル",
    "反AI", "AI規制", "AI禁止", "AI反対", "AI崩壊", "AI消滅", "AI支配", "AIの暴走", "AI暴走",
    "AI戦争", "AI兵器", "AI犯罪", "AIに仕事を奪われる", "AIで失業", "AI大量失業", "人工知能の暴走",
    "シンギュラリティ", "ロボットに支配", "ディープフェイク", "なりすまし動画", "偽動画", "偽音声",
    "扇動", "煽動", "焚きつけ", "焚き付け", "危機を煽る", "不安を煽る", "恐怖を煽る", "パニックを煽る",
    "過激化", "過激派", "デマ拡散", "情報戦", "洗脳", "洗脳される", "誤情報", "虚偽情報", "偽情報",
    "激怒", "怒り心頭", "怒り狂う", "殺意", "殺意を抱く", "憎悪", "憎しみ", "嫌悪感", "吐き気がする",
    "ブチ切れ", "ブチギレ", "キレた", "切れた", "頭に来る", "頭にきた", "許せない", "許すまじ",
    "復讐", "復讐を誓う", "恨み", "敵意", "軽蔑", "侮蔑", "見下し", "見下す", "マウント", "マウンティング"
  ];
  const STRONG_EN = [
    "politics", "political", "politician", "election", "president", "presidential",
    "campaign", "vote", "voting", "congress", "senate", "senator", "parliament",
    "parliamentarian", "prime minister", "premier", "chancellor", "cabinet", "minister",
    "lawmaker", "lawmakers", "legislation", "government", "democrat", "republican",
    "maga", "trump", "biden", "impeachment", "scandal", "corruption", "corrupt",
    "bribery", "bribe", "coup", "regime", "authoritarian", "dictatorship", "dictator",
    "sanction", "sanctions", "tariff", "tariffs", "trade war", "nato", "summit", "treaty",
    "diplomacy", "diplomatic", "geopolitical", "border", "immigrant", "immigration",
    "deportation", "shooting", "shooter", "gunman", "killed", "killing", "kills",
    "death", "deaths", "dead", "died", "dying", "murder", "massacre", "terrorist",
    "terrorism", "attack", "attacks", "bombing", "bomb", "explosion", "explosive",
    "fire", "fires", "wildfire", "crash", "accident", "accidents", "injured", "injury",
    "victim", "victims", "suicide", "protest", "riots", "riot", "war", "wars",
    "military", "soldier", "soldiers", "troops", "invasion", "occupation", "annexation",
    "missile", "missiles", "nuclear", "ceasefire", "ukraine", "russia", "putin",
    "gaza", "palestine", "israel", "hamas", "iran", "isis", "taliban", "xi jinping",
    "kim jong un", "netanyahu", "zelensky", "macron", "modi", "erdogan",
    "deep state", "new world order", "conspiracy", "conspiracy theory", "false flag",
    "rigged", "stolen election", "fake news", "propaganda", "censorship",
    "airstrike", "air strike", "artillery", "bombardment", "insurgent", "militant",
    "extremism", "radicalization", "inflation", "recession", "layoff", "layoffs",
    "bankruptcy", "unemployment", "earthquake", "flood", "floods", "hurricane",
    "tornado", "storm", "blizzard", "heat wave", "cold snap", "volcano", "volcanic",
    "tsunami", "landslide", "mudslide", "typhoon", "cyclone", "drought", "famine",
    "hostage", "kidnap", "kidnapping", "rape", "abuse", "arson",
    "theft", "robbery", "burglary", "fraud", "scam", "scammer", "embezzlement",
    "trafficking", "smuggling", "drugs", "narcotics", "ransomware", "phishing",
    "hacking", "cyberattack", "cyber attack", "casualties", "casualty", "fatality", "fatalities",
    "argument", "arguments", "arguing", "quarrel", "feud", "feuding", "hostility",
    "hostile", "toxic", "trolling", "trolls", "harassment", "cyberbullying", "bullying",
    "insult", "insults", "mocking", "ridicule", "hatred", "hate speech", "bigotry",
    "racism", "xenophobia", "misogyny", "homophobia", "discrimination",
    "artificial intelligence", "AI takeover", "AI apocalypse", "AI doom", "robot uprising",
    "singularity", "killer robots", "autonomous weapons", "AI weapons", "deepfake", "deepfakes",
    "AI replacing jobs", "AI job losses", "AI layoffs", "AI ban", "ban AI", "AI regulation",
    "incite", "incites", "inciting", "incitement", "fearmongering", "scaremongering", "hysteria",
    "misinformation", "disinformation", "brainwashing", "smear campaign", "hate campaign", "mob mentality",
    "rage", "furious", "fury", "enraged", "livid", "seething", "murderous", "despise", "despised",
    "contempt", "loathing", "loathe", "disgusting", "revolting", "repulsive", "vile", "revenge",
    "vendetta", "grudge", "animosity", "condescending", "patronizing", "smug"
  ];
  const WEAK_JP = ["論争", "議論", "意見対立", "クレーム", "苦情", "トラブル", "もめ事", "もめごと", "険悪", "ギスギス", "騒動", "不安", "心配", "ストレス", "パニック", "恐慌", "買い占め", "賛否", "賛否両論", "物議", "物議を醸す", "波紋を呼ぶ", "批判殺到", "非難殺到", "反発", "バックラッシュ", "火種", "いざこざ", "ムカつく", "イライラ", "うんざり", "最悪", "呆れた", "嫌い", "怒り", "絶望", "気持ち悪い", "嫌悪", "ゲンナリ", "ドン引き", "モヤモヤ", "ざわつく"];
  const WEAK_EN = ["controversy", "controversial", "dispute", "disputes", "debate", "debates", "complaint", "complaints", "trouble", "friction", "tension", "tensions", "stressed", "stress", "worried", "worry", "panic", "outrage", "uproar", "outcry", "furor", "backlash", "alarm", "annoyed", "annoying", "frustrated", "frustrating", "angry", "mad", "fed up", "sick of", "tired of", "gross", "disgusted", "worst", "despair", "hopeless"];

  const NEGATIVE_EXCEPT = /(?:火災保険|火災報知器|事故物件|防災|募金|チャリティ|寄付|復興支援|被災地支援|バリアフリー|無事|無傷|全員無事|けがなし|軽傷のみ|助かった)/i;
  const NEGATIVE_STRONG = new RegExp(`(?:${STRONG_JP.join("|")})|(?:${STRONG_EN.map(EN).join("|")})`, "i");
  const NEGATIVE_WEAK_G = new RegExp(`(?:${WEAK_JP.join("|")})|(?:${WEAK_EN.map(EN).join("|")})`, "gi");

  let filterOn = false;
  const hiddenTweets = new Set();

  // ===== フィルター =====
  function countWeakHits(text) {
    NEGATIVE_WEAK_G.lastIndex = 0;
    let hits = 0;
    while (hits < 2 && NEGATIVE_WEAK_G.exec(text)) hits++;
    return hits;
  }

  function matchesNegative(el) {
    const t = el.textContent || "";
    if (NEGATIVE_EXCEPT.test(t)) return false;
    if (NEGATIVE_STRONG.test(t)) return true;
    return countWeakHits(t) >= 2;
  }

  function hideTweet(art) {
    if (art.style.display !== "none" && matchesNegative(art)) {
      hiddenTweets.add(art);
      art.style.display = "none";
    }
  }

  function isHomeTimeline() {
    const p = location.pathname;
    return p === "/" || p === "/home" || p.startsWith("/home/");
  }

  function filterTimeline(root) {
    if (!filterOn) return;
    if (!isHomeTimeline()) return;
    if (root && root.tagName === "ARTICLE") { hideTweet(root); return; }
    const articles = root && root.querySelectorAll
      ? root.querySelectorAll('article[data-testid="tweet"]')
      : [];
    for (const art of articles) hideTweet(art);
  }

  function restoreTimeline() {
    for (const el of hiddenTweets) el.style.display = "";
    hiddenTweets.clear();
  }

  function setFilter(on) {
    filterOn = on;
    if (on) filterTimeline(document);
    else restoreTimeline();
  }

  // ===== 全体スタイル注入 =====
  function injectUI() {
    if (document.getElementById("x2t-ui")) return;
    const style = document.createElement("style");
    style.id = "x2t-ui";
    style.textContent = `
      html { scroll-behavior: smooth; }

      article[data-testid="tweet"] {
        transition: box-shadow .3s ease, transform .3s ease;
      }
      article[data-testid="tweet"]:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 32px rgba(15,20,25,.14), 0 2px 8px rgba(15,20,25,.08);
      }

      a[data-testid^="AppTabBar_"] {
        transition: background-color .25s ease;
      }

      a[href="/"]:not([data-testid^="AppTabBar_"]):hover {
        box-shadow: 0 0 0 10px rgba(29,161,242,.12);
        border-radius: 50%;
      }
      .x2t-bird-overlay {
        filter: drop-shadow(0 2px 6px rgba(29,161,242,.35));
      }

      img[src*="profile_images"] {
        border-radius: 50% !important;
        transition: transform .3s ease, box-shadow .3s ease;
      }
      img[src*="profile_images"]:hover {
        transform: scale(1.04);
        box-shadow: 0 4px 18px rgba(29,161,242,.3);
      }

      [data-testid="primaryColumn"] > div,
      div[data-testid="cellInnerDiv"] { border-radius: 16px; }

      form[role="search"],
      [data-testid="SearchBox_Search_Input"] {
        border-radius: 999px;
      }

      a:focus-visible, button:focus-visible {
        outline: 3px solid rgba(29,161,242,.45) !important;
        outline-offset: 2px;
        border-radius: 10px;
      }

      ::selection { background: rgba(29,161,242,.25); }
    `;
    document.head.appendChild(style);
  }

  // ===== ロゴ・ファビコン =====
  function findLogo() {
    const candidates = document.querySelectorAll('a[href="/"]');
    for (const a of candidates) {
      const tid = a.getAttribute("data-testid") || "";
      if (tid.startsWith("AppTabBar")) continue;
      if (a.querySelector("svg") || /X|𝕏|Twitter/.test(a.getAttribute("aria-label") || "")) {
        return a;
      }
    }
    return null;
  }

  function overlayBird(container) {
    if (!container || container.querySelector(".x2t-bird-overlay")) return;
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "x2t-bird-overlay");
    s.setAttribute("viewBox", "0 0 24 24");
    s.style.cssText = "position:absolute;inset:0;margin:auto;width:58%;height:58%;pointer-events:none;z-index:6;overflow:visible;";
    s.innerHTML = `<path fill="#1DA1F2" d="${BIRD_PATH}"/>`;
    container.appendChild(s);
    container.style.color = "transparent";
  }

  function ensureLogoBird() {
    const logo = findLogo();
    if (!logo) return;
    const svg = logo.querySelector("svg");
    if (svg) fixOneSvg(svg);
    const replaced = svg && !svg.querySelector('path[d*="M18.244"]');
    if (!replaced) {
      if (svg) svg.style.opacity = "0";
      overlayBird(logo);
    }
  }


  function isEditable(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.documentElement) {
      if (el.isContentEditable || el.getAttribute && el.getAttribute("contenteditable") === "true") return true;
      el = el.parentElement;
    }
    return false;
  }

  function fixTextNode(textNode) {
    if (!textNode.data || textNode.data.length === 0) return;
    if (isEditable(textNode)) return;
    if (textNode.parentElement && SKIP_TAGS.has(textNode.parentElement.tagName)) return;
    const before = textNode.data;
    const after = rebrandText(before);
    if (after !== before) textNode.nodeValue = after;
  }

  function walk(node) {
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.parentElement && SKIP_TAGS.has(n.parentElement.tagName)
          || isEditable(n)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = w.nextNode())) fixTextNode(n);
  }

  function fixTitle() {
    if (document.title && hasX(document.title)) {
      document.title = rebrandText(document.title);
    }
  }

  let currentMode = "auto";
  let currentLang = x2tDetectLang();
  let currentSplash = true;
  let currentBirds = true;
  let customColors = { top: "#C0DEED", bottom: "#8EC5E8", accent: "#1DA1F2" };
  let wallpaperOn = false;
  let wallpaperUrl = "";

  function sanitizeUrl(u) {
    if (!u) return "";
    try {
      const x = new URL(u, location.href);
      return /^https?:$/.test(x.protocol) ? x.href : "";
    } catch { return ""; }
  }

  function detectSiteTheme() {
    const cs = getComputedStyle(document.documentElement).colorScheme || "";
    if (cs.includes("dark")) return "dark";
    if (cs.includes("light")) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolveMode() {
    return currentMode === "auto" ? detectSiteTheme() : currentMode;
  }

  let bgApplying = false;
  // ===== 背景モード（自動/ライト/ダーク/カスタム）＋壁紙 =====
  function applyBackground() {
    if (bgApplying) return;
    bgApplying = true;
    try {
      const mode = resolveMode();
      const isCustom = mode === "custom";
      const custom = customColors || { top: "#C0DEED", bottom: "#8EC5E8", accent: "#1DA1F2" };
      const wallpaper = sanitizeUrl(wallpaperUrl);

      const appShell = `
        body { background: transparent !important; }
        #react-root,
        #react-root > div,
        #layers { background-color: transparent !important; }
      `;
      const light = `
        html {
          background-color: #C0DEED !important;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0, transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(29,161,242,0.18) 0, transparent 50%),
            linear-gradient(180deg, #C0DEED 0%, #8EC5E8 100%) !important;
          background-attachment: fixed !important;
        }
        ${appShell}
        body, body * {
          text-shadow: 0 1px 2px rgba(0,0,0,0.35), 0 0 2px rgba(0,0,0,0.2) !important;
        }
      `;
      const dark = `
        html {
          background-color: #15202B !important;
          background-image:
            radial-gradient(circle at 80% 20%, rgba(29,161,242,0.15) 0, transparent 45%),
            radial-gradient(circle at 20% 90%, rgba(29,161,242,0.08) 0, transparent 50%),
            linear-gradient(180deg, #1B2A3A 0%, #15202B 100%) !important;
          background-attachment: fixed !important;
        }
        body { background: transparent !important; }
        header,
        header *,
        nav[aria-label="Primary"],
        nav[aria-label="Primary"] *,
        [data-testid="SideNav_AccountSwitcher_Button"] {
          color: #f7f9f9 !important;
        }
        nav[aria-label="Primary"] a:hover,
        nav[aria-label="Primary"] button:hover,
        [data-testid="SideNav_AccountSwitcher_Button"]:hover {
          background-color: rgba(255,255,255,0.08) !important;
        }
        body, body * {
          text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(0,0,0,0.35) !important;
        }
      `;
      const customCss = `
        html {
          background-color: ${custom.top} !important;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.28) 0, transparent 45%),
            radial-gradient(circle at 80% 70%, ${custom.accent}33 0, transparent 50%),
            linear-gradient(180deg, ${custom.top} 0%, ${custom.bottom} 100%) !important;
          background-attachment: fixed !important;
        }
        ${appShell}
        body, body * {
          text-shadow: 0 1px 2px rgba(0,0,0,0.35), 0 0 2px rgba(0,0,0,0.2) !important;
        }
      `;
      const wallpaperCss = `
        html {
          background-color: ${isCustom ? custom.top : mode === "dark" ? "#15202B" : "#C0DEED"} !important;
          background-image: url("${wallpaper}") !important;
          background-size: cover !important;
          background-position: center !important;
          background-attachment: fixed !important;
        }
        ${appShell}
        body, body * {
          text-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 0 3px rgba(0,0,0,0.25) !important;
        }
      `;

      let css;
      if (wallpaperOn && wallpaper) css = wallpaperCss;
      else if (isCustom) css = customCss;
      else css = mode === "dark" ? dark : light;

      let style = document.getElementById("x2t-bg");
      if (!style) {
        style = document.createElement("style");
        style.id = "x2t-bg";
        document.head.appendChild(style);
      }
      style.textContent = css;
      const birdColor = isCustom
        ? custom.accent
        : mode === "dark" ? "rgba(140,200,255,0.9)" : "rgba(29,161,242,0.85)";
      if (document.documentElement.style.getPropertyValue("--x2t-bird-color") !== birdColor) {
        document.documentElement.style.setProperty("--x2t-bird-color", birdColor);
      }
    } finally {
      bgApplying = false;
    }
  }

  function fixFavicon() {
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }
    link.href = BIRD_SVG_DATA;
  }

  function fixOneSvg(svg) {
    if (!svg.querySelector) return;
    const logo = svg.querySelector('path[d*="M18.244"]');
    if (!logo) return;
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    svg.innerHTML = `<path fill="#1DA1F2" style="fill:#1DA1F2" d="${BIRD_PATH}"/>`;
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.fill = "#1DA1F2";
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Twitter");
    if (width) svg.setAttribute("width", width);
    if (height) svg.setAttribute("height", height);
  }

  function fixLogos(root) {
    if (root.tagName === "SVG") fixOneSvg(root);
    const svgs = root.querySelectorAll ? root.querySelectorAll("svg") : [];
    for (const svg of svgs) fixOneSvg(svg);
    const labels = root.querySelectorAll ? root.querySelectorAll("[aria-label], [title], [alt]") : [];
    for (const el of labels) {
      for (const attr of ["aria-label", "title", "alt"]) fixLabel(el, attr);
    }
  }

  // ===== 環境演出（浮かぶ鳥・飛ぶ鳥）=====
  function injectAmbientBirds() {
    if (!currentBirds) return;
    if (document.getElementById("x2t-birds")) return;
    const c = document.createElement("div");
    c.id = "x2t-birds";
    c.setAttribute("aria-hidden", "true");
    const bird = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block"><path fill="var(--x2t-bird-color, #1DA1F2)" d="${BIRD_PATH}"/></svg>`;
    c.innerHTML = `
      <style>
        #x2t-birds {
          position: fixed; inset: 0; z-index: -1;
          pointer-events: none; overflow: hidden;
        }
        #x2t-birds .bird { position: absolute; opacity: .5; filter: drop-shadow(0 2px 6px rgba(29,161,242,.18)); }
        #x2t-birds .b1 { left: 6%;  top: 16%; width: 44px; height: 44px; animation: x2t-float 7s ease-in-out infinite alternate; }
        #x2t-birds .b2 { left: 88%; top: 34%; width: 32px; height: 32px; animation: x2t-float 9s ease-in-out 1.2s infinite alternate; }
        #x2t-birds .b3 { left: 4%;  top: 70%; width: 30px; height: 30px; animation: x2t-float 8s ease-in-out 2s infinite alternate; }
        #x2t-birds .b4 { left: 89%; top: 78%; width: 38px; height: 38px; animation: x2t-float 10s ease-in-out .6s infinite alternate; }
        #x2t-birds .f1 { left: -70px; top: 24%; width: 30px; height: 30px; opacity: .3; animation: x2t-fly 34s linear infinite; }
        #x2t-birds .f2 { left: -70px; top: 64%; width: 24px; height: 24px; opacity: .24; animation: x2t-fly 46s linear 12s infinite; }
        @keyframes x2t-float {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-22px) rotate(5deg); }
        }
        @keyframes x2t-fly {
          0%   { transform: translateX(0) translateY(0) rotate(-8deg); }
          50%  { transform: translateX(52vw) translateY(-26px) rotate(2deg); }
          100% { transform: translateX(105vw) translateY(0) rotate(8deg); }
        }
      </style>
      <span class="bird b1">${bird}</span>
      <span class="bird b2">${bird}</span>
      <span class="bird b3">${bird}</span>
      <span class="bird b4">${bird}</span>
      <span class="bird f1">${bird}</span>
      <span class="bird f2">${bird}</span>
    `;
    document.body.appendChild(c);
  }

  // ===== スプラッシュ画面 =====
  function showSplash() {
    if (!currentSplash) return;
    if (window.top !== window) return;
    if (document.getElementById("x2t-splash")) return;
    const splash = document.createElement("div");
    splash.id = "x2t-splash";
    splash.innerHTML = `
      <style>
        #x2t-splash {
          position: fixed; inset: 0; z-index: 2147483647;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
          background: linear-gradient(135deg, #1DA1F2 0%, #0d8bdb 55%, #0a73b8 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }
        #x2t-splash .x2t-splash-bird {
          width: 92px; height: 92px;
          filter: drop-shadow(0 6px 18px rgba(0,0,0,.22));
          animation: x2t-splash-pulse 1.15s ease-in-out infinite;
        }
        #x2t-splash .x2t-splash-title { color: #fff; font-size: 24px; font-weight: 800; letter-spacing: .5px; }
        #x2t-splash .x2t-splash-sub { color: rgba(255,255,255,.85); font-size: 12px; margin-top: 4px; }
        @keyframes x2t-splash-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.09); }
        }
      </style>
      <svg class="x2t-splash-bird" viewBox="0 0 24 24"><path fill="#fff" d="${BIRD_PATH}"/></svg>
      <div style="text-align:center">
        <div class="x2t-splash-title">Twitter 2</div>
        <div class="x2t-splash-sub">${x2tText(currentLang, "splashSub")}</div>
      </div>
    `;
    document.documentElement.appendChild(splash);
    setTimeout(() => splash.remove(), 1300);
  }

  // ===== 起動・DOM監視 =====
  function fixAll() {
    injectAmbientBirds();
    fixTitle();
    fixFavicon();
    applyBackground();
    injectUI();
    walk(document.body);
    fixLogos(document);
    ensureLogoBird();
  }

  function fixSubtree(root) {
    if (root.nodeType === Node.TEXT_NODE) { fixTextNode(root); return; }
    if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      walk(root);
      fixLogos(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_TAGS.has(root.tagName)) return;
    if (root.tagName === "SVG") { fixLogos(root); return; }
    walk(root);
    fixLogos(root);
  }

  let logoFixTimer = null;
  function queueLogoFix() {
    if (logoFixTimer) return;
    logoFixTimer = setTimeout(() => {
      logoFixTimer = null;
      ensureLogoBird();
    }, 200);
  }

  function isOrContainsLogo(el) {
    return (el.matches && el.matches('a[href="/"]')) ||
           (el.querySelector && el.querySelector('a[href="/"]'));
  }

  function handleAdded(el) {
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    if (isOrContainsLogo(el)) queueLogoFix();
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const added of m.addedNodes) {
        fixSubtree(added);
        filterTimeline(added);
        handleAdded(added);
      }
      if (m.type === "characterData") fixTextNode(m.target);
      if (m.type === "attributes") {
        if (m.target === document.documentElement) {
          fixTitle();
          fixFavicon();
          if (currentMode === "auto") applyBackground();
        }
        if (m.target.getAttribute && /aria-label|title|alt/.test(m.attributeName)) {
          fixLabel(m.target, m.attributeName);
        }
      }
    }
  });

  fixAll();
  setInterval(fixFavicon, 5000);
  X2TStorage.get(["x2tMode", "x2tFilter", "x2tSplash", "x2tBirds", "x2tLang", "x2tCustom", "x2tWallpaperUrl", "x2tWallpaperOn"], ({ x2tMode, x2tFilter, x2tSplash, x2tBirds, x2tLang, x2tCustom, x2tWallpaperUrl, x2tWallpaperOn }) => {
    currentMode = x2tMode || "auto";
    currentLang = x2tLang || x2tDetectLang();
    currentSplash = x2tSplash !== false;
    currentBirds = x2tBirds !== false;
    if (x2tCustom && x2tCustom.top && x2tCustom.bottom && x2tCustom.accent) customColors = x2tCustom;
    wallpaperUrl = x2tWallpaperUrl || "";
    wallpaperOn = !!x2tWallpaperOn;
    showSplash();
    applyBackground();
    setFilter(!!x2tFilter);
  });
  X2TStorage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.x2tMode) {
      currentMode = changes.x2tMode.newValue || "auto";
      applyBackground();
    }
    if (changes.x2tFilter) setFilter(!!changes.x2tFilter.newValue);
    if (changes.x2tSplash) {
      currentSplash = !!changes.x2tSplash.newValue;
      if (currentSplash) showSplash();
    }
    if (changes.x2tBirds) {
      currentBirds = !!changes.x2tBirds.newValue;
      if (currentBirds) injectAmbientBirds();
    }
    if (changes.x2tCustom) {
      if (changes.x2tCustom.newValue && changes.x2tCustom.newValue.top) customColors = changes.x2tCustom.newValue;
      applyBackground();
    }
    if (changes.x2tWallpaperUrl) {
      wallpaperUrl = changes.x2tWallpaperUrl.newValue || "";
      applyBackground();
    }
    if (changes.x2tWallpaperOn) {
      wallpaperOn = !!changes.x2tWallpaperOn.newValue;
      applyBackground();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "title", "alt", "href", "style", "class"]
  });
})();
