const buttons = document.querySelectorAll("#seg button");
const langButtons = document.querySelectorAll("#langSeg button");
const filterToggle = document.getElementById("filter");
const artToggle = document.getElementById("art");
const disasterToggle = document.getElementById("disaster");
const foodToggle = document.getElementById("food");
const hideGovToggle = document.getElementById("hideGov");
const hideNewsToggle = document.getElementById("hideNews");
const hideTrendsToggle = document.getElementById("hideTrends");
const hideFinToggle = document.getElementById("hideFin");
const splashToggle = document.getElementById("splash");
const birdsToggle = document.getElementById("birds");
const customColors = document.getElementById("customColors");
const colorTop = document.getElementById("colorTop");
const colorBottom = document.getElementById("colorBottom");
const colorAccent = document.getElementById("colorAccent");
const wallpaperToggle = document.getElementById("wallpaper");
const wallpaperUrl = document.getElementById("wallpaperUrl");

const DEFAULT_CUSTOM = { top: "#C0DEED", bottom: "#8EC5E8", accent: "#1DA1F2" };

function setActive(mode) {
  for (const b of buttons) b.classList.toggle("active", b.dataset.mode === mode);
  customColors.classList.toggle("visible", mode === "custom");
}

function render(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = x2tText(lang, el.dataset.i18n);
  });
  for (const b of langButtons) b.classList.toggle("active", b.dataset.lang === lang);
}

function saveCustom() {
  chrome.storage.local.set({
    x2tCustom: { top: colorTop.value, bottom: colorBottom.value, accent: colorAccent.value }
  });
}

chrome.storage.local.get(
  ["x2tMode", "x2tFilter", "x2tArt", "x2tDisaster", "x2tFood", "x2tHideGov", "x2tHideNews", "x2tHideTrends", "x2tHideFin", "x2tSplash", "x2tBirds", "x2tLang", "x2tCustom", "x2tWallpaperUrl", "x2tWallpaperOn"],
  ({ x2tMode, x2tFilter, x2tArt, x2tDisaster, x2tFood, x2tHideGov, x2tHideNews, x2tHideTrends, x2tHideFin, x2tSplash, x2tBirds, x2tLang, x2tCustom, x2tWallpaperUrl, x2tWallpaperOn }) => {
    render(x2tLang || x2tDetectLang());
    setActive(x2tMode || "auto");
    filterToggle.checked = !!x2tFilter;
    artToggle.checked = !!x2tArt;
    disasterToggle.checked = !!x2tDisaster;
    foodToggle.checked = !!x2tFood;
    hideGovToggle.checked = !!x2tHideGov;
    hideNewsToggle.checked = !!x2tHideNews;
    hideTrendsToggle.checked = !!x2tHideTrends;
    hideFinToggle.checked = !!x2tHideFin;
    splashToggle.checked = x2tSplash !== false;
    birdsToggle.checked = x2tBirds !== false;
    const c = x2tCustom && x2tCustom.top ? x2tCustom : DEFAULT_CUSTOM;
    colorTop.value = c.top;
    colorBottom.value = c.bottom;
    colorAccent.value = c.accent;
    wallpaperToggle.checked = x2tWallpaperOn !== false;
    wallpaperUrl.value = x2tWallpaperUrl || "";
  }
);

for (const b of buttons) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ x2tMode: b.dataset.mode });
    setActive(b.dataset.mode);
  });
}

colorTop.addEventListener("input", saveCustom);
colorBottom.addEventListener("input", saveCustom);
colorAccent.addEventListener("input", saveCustom);

document.querySelectorAll(".preset").forEach((p) => {
  const c = JSON.parse(p.dataset.p);
  p.style.background = `linear-gradient(135deg, ${c.top}, ${c.bottom})`;
  p.addEventListener("click", () => {
    colorTop.value = c.top;
    colorBottom.value = c.bottom;
    colorAccent.value = c.accent;
    saveCustom();
  });
});

wallpaperToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tWallpaperOn: wallpaperToggle.checked });
});

wallpaperUrl.addEventListener("change", () => {
  chrome.storage.local.set({ x2tWallpaperUrl: wallpaperUrl.value.trim() });
});

filterToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tFilter: filterToggle.checked });
});

artToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tArt: artToggle.checked });
});

disasterToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tDisaster: disasterToggle.checked });
});

foodToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tFood: foodToggle.checked });
});

hideGovToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideGov: hideGovToggle.checked });
});

hideNewsToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideNews: hideNewsToggle.checked });
});

hideTrendsToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideTrends: hideTrendsToggle.checked });
});

hideFinToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideFin: hideFinToggle.checked });
});

splashToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tSplash: splashToggle.checked });
});

birdsToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tBirds: birdsToggle.checked });
});

for (const b of langButtons) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ x2tLang: b.dataset.lang });
    render(b.dataset.lang);
  });
}
