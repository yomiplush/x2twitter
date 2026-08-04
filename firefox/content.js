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


  let filterOn = false;
  const hiddenTweets = new Set();

  // ===== フィルター =====
  // 弱シグナルは2ヒットで非表示。ただし「日本を主語にした批判」は、
  // 批判ワードが1つでもあれば「日本を主語にした」ことを2ヒット目として扱う
  function countWeakHits(text) {
    NEGATIVE_WEAK_G.lastIndex = 0;
    let hits = 0;
    while (hits < 2 && NEGATIVE_WEAK_G.exec(text)) hits++;
    if (hits >= 1) {
      JAPAN_SUBJECT_G.lastIndex = 0;
      if (JAPAN_SUBJECT_G.test(text)) hits = 2;
    }
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
  function isBrandLogo(a) {
    if (!a || !a.getAttribute) return false;
    const tid = a.getAttribute("data-testid") || "";
    if (tid.startsWith("AppTabBar")) return false;
    return (a.querySelector && a.querySelector("svg")) || /X|𝕏|Twitter/.test(a.getAttribute("aria-label") || "");
  }

  function findLogo() {
    for (const a of document.querySelectorAll('a[href="/"]')) {
      if (isBrandLogo(a)) return a;
    }
    return null;
  }

  let logoBirdEl = null;
  function getLogoBird() {
    if (!logoBirdEl) {
      logoBirdEl = document.createElement("div");
      logoBirdEl.setAttribute("aria-hidden", "true");
      logoBirdEl.style.cssText = "position:fixed;z-index:2147483000;pointer-events:none;display:flex;align-items:center;justify-content:center;";
      logoBirdEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:58%;height:58%;display:block;filter:drop-shadow(0 2px 6px rgba(29,161,242,.35));"><path fill="var(--x2t-bird-color, #1DA1F2)" d="${BIRD_PATH}"/></svg>`;
      document.body.appendChild(logoBirdEl);
    }
    return logoBirdEl;
  }

  function paintLogoBird(logo) {
    const b = getLogoBird();
    if (!logo) { b.style.display = "none"; return; }
    const r = logo.getBoundingClientRect();
    if (!r || (r.width === 0 && r.height === 0)) { b.style.display = "none"; return; }
    b.style.display = "flex";
    b.style.left = r.left + "px";
    b.style.top = r.top + "px";
    b.style.width = r.width + "px";
    b.style.height = r.height + "px";
  }

  let birdListenersWired = false;
  function wireBirdListeners() {
    if (birdListenersWired) return;
    birdListenersWired = true;
    window.addEventListener("scroll", () => paintLogoBird(findLogo()), { passive: true });
    window.addEventListener("resize", () => paintLogoBird(findLogo()));
  }

  function ensureLogoBird() {
    let visible = null;
    let first = null;
    for (const a of document.querySelectorAll('a[href="/"]')) {
      if (!isBrandLogo(a)) continue;
      if (!first) first = a;
      const svg = a.querySelector("svg");
      if (svg) fixOneSvg(svg);
      if (!visible) {
        const r = a.getBoundingClientRect();
        if (r && r.width > 0 && r.height > 0) visible = a;
      }
    }
    paintLogoBird(visible || first);
    wireBirdListeners();
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
    if (!svg.querySelector('path[d*="M18.244"]')) return;
    svg.style.setProperty("visibility", "hidden", "important");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Twitter");
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

  // ===== Homeで先頭へ自動スクロール =====
  function scrollTop() {
    const sc = document.scrollingElement || document.documentElement;
    sc.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      if (sc.scrollTop > 0) sc.scrollTop = 0;
    }, 500);
  }

  document.addEventListener("click", e => {
    if (e.button !== 0) return;
    const a = e.target && e.target.closest
      ? e.target.closest('a[href="/"], a[href="/home"], [data-testid="AppTabBar_Home_Link"]')
      : null;
    if (!a) return;
    if (isHomeTimeline()) scrollTop();
    else setTimeout(scrollTop, 150);
  }, true);

  ["pushState", "replaceState"].forEach(m => {
    const orig = history[m];
    history[m] = function (...args) {
      const r = orig.apply(this, args);
      if (isHomeTimeline()) setTimeout(scrollTop, 200);
      return r;
    };
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "title", "alt", "href", "style", "class"]
  });
})();
