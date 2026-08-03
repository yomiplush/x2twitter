const buttons = document.querySelectorAll("#seg button");
const filterToggle = document.getElementById("filter");

function setActive(mode) {
  for (const b of buttons) b.classList.toggle("active", b.dataset.mode === mode);
}

chrome.storage.local.get(["x2tMode", "x2tFilter"], ({ x2tMode, x2tFilter }) => {
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