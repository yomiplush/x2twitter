const buttons = document.querySelectorAll("#seg button");
const langButtons = document.querySelectorAll("#langSeg button");
const filterToggle = document.getElementById("filter");
const splashToggle = document.getElementById("splash");
const birdsToggle = document.getElementById("birds");

function setActive(mode) {
  for (const b of buttons) b.classList.toggle("active", b.dataset.mode === mode);
}

function render(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = x2tText(lang, el.dataset.i18n);
  });
  for (const b of langButtons) b.classList.toggle("active", b.dataset.lang === lang);
}

X2TStorage.get(
  ["x2tMode", "x2tFilter", "x2tSplash", "x2tBirds", "x2tLang"],
  ({ x2tMode, x2tFilter, x2tSplash, x2tBirds, x2tLang }) => {
    render(x2tLang || x2tDetectLang());
    setActive(x2tMode || "auto");
    filterToggle.checked = !!x2tFilter;
    splashToggle.checked = x2tSplash !== false;
    birdsToggle.checked = x2tBirds !== false;
  }
);

for (const b of buttons) {
  b.addEventListener("click", () => {
    X2TStorage.set({ x2tMode: b.dataset.mode });
    setActive(b.dataset.mode);
  });
}

filterToggle.addEventListener("change", () => {
  X2TStorage.set({ x2tFilter: filterToggle.checked });
});

splashToggle.addEventListener("change", () => {
  X2TStorage.set({ x2tSplash: splashToggle.checked });
});

birdsToggle.addEventListener("change", () => {
  X2TStorage.set({ x2tBirds: birdsToggle.checked });
});

for (const b of langButtons) {
  b.addEventListener("click", () => {
    X2TStorage.set({ x2tLang: b.dataset.lang });
    render(b.dataset.lang);
  });
}
