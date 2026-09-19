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

      /* ===== ロゴの鳥：自然なアイドル（羽ばたき→滑空→ゆらぎ）===== */
      .x2t-logo-bird svg {
        transform-origin: 50% 62%;
        animation: x2t-logo-idle 4s ease-in-out infinite;
        will-change: transform;
      }
      @keyframes x2t-logo-idle {
        0%   { transform: translateY(0) rotate(0deg) scaleY(1); }
        4%   { transform: translateY(-1.2%) rotate(-.4deg) scaleY(.86); }
        8%   { transform: translateY(.4%) rotate(.3deg) scaleY(1.07); }
        12%  { transform: translateY(-1%) rotate(-.3deg) scaleY(.87); }
        16%  { transform: translateY(.3%) rotate(.2deg) scaleY(1.05); }
        21%  { transform: translateY(-.8%) rotate(-.2deg) scaleY(.9); }
        27%  { transform: translateY(0) rotate(0deg) scaleY(1); }
        55%  { transform: translateY(-2%) rotate(-1.2deg) scaleY(1); }
        80%  { transform: translateY(1%) rotate(.8deg) scaleY(1); }
        100% { transform: translateY(0) rotate(0deg) scaleY(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .x2t-logo-bird svg { animation: none !important; }
      }
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
      logoBirdEl.className = "x2t-logo-bird";
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
    let title = document.title || "";
    if (currentBusy) {
      title = title.replace(/^\s*\([\d.,]+\)\s*/, "");
    }
    if (title && hasX(title)) title = rebrandText(title);
    if (title !== document.title) document.title = title;
  }

  let currentMode = "auto";
  let currentLang = x2tDetectLang();
  let currentSplash = true;
  let currentBirds = true;
  let currentBusy = false;
  let currentHideTrends = false;
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

  // ===== トレンド非表示 =====
  let trendsStyle = null;
  function applyTrendsHide() {
    if (currentHideTrends) {
      if (!trendsStyle) {
        trendsStyle = document.createElement("style");
        trendsStyle.id = "x2t-trends";
        document.head.appendChild(trendsStyle);
      }
      trendsStyle.textContent = `
        [data-testid="sidebarColumn"] [aria-label^="Timeline: Trending"],
        [data-testid="sidebarColumn"] [aria-label*="Trending now"],
        [data-testid="sidebarColumn"] [aria-label*="トレンド"] {
          display: none !important;
        }
      `;
    } else {
      if (trendsStyle) trendsStyle.remove();
      trendsStyle = null;
    }
  }

  // ===== Busy Mode（通知・DMの青い数字バッジをすべて非表示）=====
  let busyStyle = null;
  function applyBusy() {
    if (currentBusy) {
      if (!busyStyle) {
        busyStyle = document.createElement("style");
        busyStyle.id = "x2t-busy";
        document.head.appendChild(busyStyle);
      }
      busyStyle.textContent = `
        [data-testid="AppTabBar_Notifications_Link"] [dir="ltr"],
        [data-testid="AppTabBar_DirectMessage_Link"] [dir="ltr"],
        [data-testid="AppTabBar_Notifications_Link"] [aria-label*="notifications"],
        [data-testid="AppTabBar_DirectMessage_Link"] [aria-label*="message"] {
          display: none !important;
        }
      `;
    } else {
      if (busyStyle) busyStyle.remove();
      busyStyle = null;
    }
    fixTitle();
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

  // ===== 環境演出（浮かぶ鳥）=====
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
        /* 位置・移動は .bird、羽ばたきは内側の svg で別レイヤーに分ける */
        #x2t-birds .bird {
          position: absolute;
          filter: drop-shadow(0 2px 6px rgba(29,161,242,.18));
          will-change: transform, opacity;
        }
        #x2t-birds .bird svg {
          display: block; width: 100%; height: 100%;
          transform-origin: 50% 62%;
          will-change: transform;
          animation: x2t-flap var(--flap, 3.4s) ease-in-out var(--flapDelay, 0s) infinite;
        }
        /* 羽ばたき（数回バタついて、あとは滑空） */
        @keyframes x2t-flap {
          0%    { transform: scaleY(1); }
          3%    { transform: scaleY(.84); }
          6.5%  { transform: scaleY(1.08); }
          10%   { transform: scaleY(.85); }
          13.5% { transform: scaleY(1.06); }
          17%   { transform: scaleY(.88); }
          21%   { transform: scaleY(1); }
          100%  { transform: scaleY(1); }
        }
        /* 浮遊：ゆっくり漂い、わずかに傾く */
        @keyframes x2t-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(calc(var(--tilt, 4deg) * -1)); }
          28%      { transform: translate3d(var(--sway, 3px), calc(var(--bob, 16px) * -1), 0) rotate(var(--tilt, 4deg)); }
          62%      { transform: translate3d(calc(var(--sway, 3px) * -0.5), calc(var(--bob, 16px) * -0.35), 0) rotate(calc(var(--tilt, 4deg) * 0.15)); }
          82%      { transform: translate3d(calc(var(--sway, 3px) * 0.6), calc(var(--bob, 16px) * -0.7), 0) rotate(calc(var(--tilt, 4deg) * 0.7)); }
        }
        /* 浮かぶ鳥（止まり木のイメージ） */
        #x2t-birds .b1 { left: 6%;  top: 16%; width: 44px; height: 44px; opacity: .5;  --bob: 20px; --sway: 4px; --tilt: 5deg; --flap: 4.2s; --flapDelay: .3s; animation: x2t-float 7.5s  ease-in-out infinite; }
        #x2t-birds .b2 { left: 88%; top: 34%; width: 32px; height: 32px; opacity: .46; --bob: 14px; --sway: 3px; --tilt: 4deg; --flap: 3.8s; --flapDelay: 1.4s; animation: x2t-float 9.5s  ease-in-out 1.1s infinite; }
        #x2t-birds .b3 { left: 4%;  top: 70%; width: 30px; height: 30px; opacity: .44; --bob: 12px; --sway: 3px; --tilt: 6deg; --flap: 4.6s; --flapDelay: .8s;  animation: x2t-float 8.4s  ease-in-out 2s infinite; }
        #x2t-birds .b4 { left: 89%; top: 78%; width: 38px; height: 38px; opacity: .48; --bob: 18px; --sway: 4px; --tilt: 5deg; --flap: 4s;   --flapDelay: 2.2s; animation: x2t-float 10.4s ease-in-out .5s infinite; }
        @media (prefers-reduced-motion: reduce) {
          #x2t-birds .bird, #x2t-birds .bird svg { animation: none !important; }
        }
      </style>
      <span class="bird b1">${bird}</span>
      <span class="bird b2">${bird}</span>
      <span class="bird b3">${bird}</span>
      <span class="bird b4">${bird}</span>
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
    if (globalThis.X2TFilter) X2TFilter.refreshHandle();
    applyTrendsHide();
    applyBusy();
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
        if (globalThis.X2TFilter) X2TFilter.apply(added);
        handleAdded(added);
      }
      if (m.type === "characterData") {
        if (m.target.parentElement && m.target.parentElement.tagName === "TITLE") fixTitle();
        else fixTextNode(m.target);
      }
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
  setInterval(() => { fixFavicon(); fixTitle(); if (globalThis.X2TFilter) X2TFilter.refreshHandle(); }, 3000);
  chrome.storage.local.get(["x2tMode", "x2tFilter", "x2tSplash", "x2tBirds", "x2tLang", "x2tCustom", "x2tWallpaperUrl", "x2tWallpaperOn", "x2tHideDisaster", "x2tHideFood", "x2tHideAiHype", "x2tArt", "x2tBusy", "x2tHideGov", "x2tHideNews", "x2tHideTrends", "x2tHideFin", "x2tHideInsult", "x2tStrength"], ({ x2tMode, x2tFilter, x2tSplash, x2tBirds, x2tLang, x2tCustom, x2tWallpaperUrl, x2tWallpaperOn, x2tHideDisaster, x2tHideFood, x2tHideAiHype, x2tArt, x2tBusy, x2tHideGov, x2tHideNews, x2tHideTrends, x2tHideFin, x2tHideInsult, x2tStrength }) => {
    currentMode = x2tMode || "auto";
    currentLang = x2tLang || x2tDetectLang();
    currentSplash = x2tSplash !== false;
    currentBirds = x2tBirds !== false;
    currentBusy = !!x2tBusy;
    currentHideTrends = !!x2tHideTrends;
    if (x2tCustom && x2tCustom.top && x2tCustom.bottom && x2tCustom.accent) customColors = x2tCustom;
    wallpaperUrl = x2tWallpaperUrl || "";
    wallpaperOn = !!x2tWallpaperOn;
    if (globalThis.X2TFilter) {
      X2TFilter.configure({
        filterOn: !!x2tFilter,
        art: !!x2tArt,
        strength: x2tStrength || "standard",
        hideGov: !!x2tHideGov,
        hideNews: !!x2tHideNews,
        hideFin: !!x2tHideFin,
        hideInsult: !!x2tHideInsult,
        hideDisaster: x2tHideDisaster !== false,
        hideFood: x2tHideFood !== false,
        hideAiHype: x2tHideAiHype !== false,
      });
    }
    showSplash();
    applyBackground();
    applyTrendsHide();
    applyBusy();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.x2tMode) {
      currentMode = changes.x2tMode.newValue || "auto";
      applyBackground();
    }
    if (changes.x2tFilter && globalThis.X2TFilter) X2TFilter.configure({ filterOn: !!changes.x2tFilter.newValue });
    if (changes.x2tSplash) {
      currentSplash = !!changes.x2tSplash.newValue;
      if (currentSplash) showSplash();
    }
    if (changes.x2tBirds) {
      currentBirds = !!changes.x2tBirds.newValue;
      if (currentBirds) injectAmbientBirds();
      else {
        const el = document.getElementById("x2t-birds");
        if (el) el.remove();
      }
    }
    if (globalThis.X2TFilter) {
      if (changes.x2tHideDisaster) X2TFilter.configure({ hideDisaster: changes.x2tHideDisaster.newValue !== false });
      if (changes.x2tHideFood) X2TFilter.configure({ hideFood: changes.x2tHideFood.newValue !== false });
      if (changes.x2tHideAiHype) X2TFilter.configure({ hideAiHype: changes.x2tHideAiHype.newValue !== false });
      if (changes.x2tHideGov) X2TFilter.configure({ hideGov: !!changes.x2tHideGov.newValue });
      if (changes.x2tHideNews) X2TFilter.configure({ hideNews: !!changes.x2tHideNews.newValue });
      if (changes.x2tStrength) X2TFilter.configure({ strength: changes.x2tStrength.newValue || "standard" });
    }
    if (changes.x2tHideTrends) {
      currentHideTrends = !!changes.x2tHideTrends.newValue;
      applyTrendsHide();
    }
    if (globalThis.X2TFilter) {
      if (changes.x2tHideFin) X2TFilter.configure({ hideFin: !!changes.x2tHideFin.newValue });
      if (changes.x2tHideInsult) X2TFilter.configure({ hideInsult: !!changes.x2tHideInsult.newValue });
      if (changes.x2tArt) X2TFilter.configure({ art: !!changes.x2tArt.newValue });
    }
    if (changes.x2tBusy) {
      currentBusy = !!changes.x2tBusy.newValue;
      applyBusy();
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
  function isHomeTimeline() {
    const p = location.pathname;
    return p === "/" || p === "/home" || p.startsWith("/home/");
  }

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
