const buttons = document.querySelectorAll("#seg button");
const langButtons = document.querySelectorAll("#langSeg button");
const filterToggle = document.getElementById("filter");

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

chrome.storage.local.get(["x2tMode", "x2tFilter", "x2tLang"], ({ x2tMode, x2tFilter, x2tLang }) => {
  render(x2tLang || x2tDetectLang());
  setActive(x2tMode || "auto");
  filterToggle.checked = !!x2tFilter;
});

for (const b of buttons) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ x2tMode: b.dataset.mode });
    setActive(b.dataset.mode);
  });
}

filterToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tFilter: filterToggle.checked });
});

for (const b of langButtons) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ x2tLang: b.dataset.lang });
    render(b.dataset.lang);
  });
}
