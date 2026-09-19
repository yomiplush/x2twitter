const buttons = document.querySelectorAll("#seg button");
const langButtons = document.querySelectorAll("#langSeg button");
const filterToggle = document.getElementById("filter");
const artToggle = document.getElementById("art");
const busyToggle = document.getElementById("busy");
const disasterToggle = document.getElementById("hideDisaster");
const foodToggle = document.getElementById("hideFood");
const aiHypeToggle = document.getElementById("hideAiHype");
const hideGovToggle = document.getElementById("hideGov");
const hideNewsToggle = document.getElementById("hideNews");
const hideTrendsToggle = document.getElementById("hideTrends");
const hideFinToggle = document.getElementById("hideFin");
const hideInsultToggle = document.getElementById("hideInsult");
const strengthButtons = document.querySelectorAll("#strengthSeg button");
const diagRun = document.getElementById("diagRun");
const diagResult = document.getElementById("diagResult");
const splashToggle = document.getElementById("splash");
const birdsToggle = document.getElementById("birds");
const customColors = document.getElementById("customColors");
const colorTop = document.getElementById("colorTop");
const colorBottom = document.getElementById("colorBottom");
const colorAccent = document.getElementById("colorAccent");
const wallpaperToggle = document.getElementById("wallpaper");
const wallpaperUrl = document.getElementById("wallpaperUrl");
const timerDisplay = document.getElementById("timerDisplay");
const timerPresets = document.querySelectorAll(".timer-presets button");
const timerCustom = document.getElementById("timerCustom");
const timerStart = document.getElementById("timerStart");
const timerStop = document.getElementById("timerStop");
const timerSound = document.getElementById("timerSound");
const timerStatus = document.getElementById("timerStatus");

const DEFAULT_CUSTOM = { top: "#C0DEED", bottom: "#8EC5E8", accent: "#1DA1F2" };
const TIMER_ALARM = "x2tPostTimer";

let currentLang = "ja";
let currentStrength = "standard";
let lastDiag = null;
let timerInterval = null;

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return h + ":" + m + ":" + sec;
}

function startTimer(ms) {
  const end = Date.now() + ms;
  chrome.storage.local.set({ x2tTimerEnd: end, x2tTimerDone: false });
  chrome.alarms.create(TIMER_ALARM, { when: end });
  updateTimer(end);
  document.body.classList.add("timer-running");
  document.body.classList.remove("timer-done");
}

function stopTimer() {
  chrome.alarms.clear(TIMER_ALARM);
  chrome.storage.local.set({ x2tTimerEnd: null, x2tTimerDone: false });
  clearInterval(timerInterval);
  timerInterval = null;
  timerDisplay.textContent = "--:--:--";
  timerStatus.textContent = "";
  document.body.classList.remove("timer-running", "timer-done");
}

function updateTimer(end) {
  clearInterval(timerInterval);
  const tick = () => {
    const remain = end - Date.now();
    if (remain <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerDisplay.textContent = "00:00:00";
      document.body.classList.remove("timer-running");
      document.body.classList.add("timer-done");
      timerStatus.textContent = x2tText(currentLang, "timerDoneLabel");
      return;
    }
    timerDisplay.textContent = fmt(remain);
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function setActive(mode) {
  for (const b of buttons) b.classList.toggle("active", b.dataset.mode === mode);
  customColors.classList.toggle("visible", mode === "custom");
}

function render(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = x2tText(lang, el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = x2tText(lang, el.dataset.i18nTitle);
  });
  for (const b of langButtons) b.classList.toggle("active", b.dataset.lang === lang);
  renderDiag(lastDiag);
}

function setStrength(level) {
  currentStrength = level || "standard";
  for (const b of strengthButtons) b.classList.toggle("active", b.dataset.strength === currentStrength);
}

function renderDiag(res) {
  lastDiag = res || null;
  if (!res) { diagResult.textContent = ""; return; }
  const pct = Math.round(res.accuracy * 100);
  let txt = x2tText(currentLang, res.failed === 0 ? "diagPass" : "diagFail")
    .replace("{p}", res.passed).replace("{t}", res.total).replace("{pct}", pct);
  if (res.failed > 0) {
    txt += " — " + res.results.filter(r => !r.ok).map(r => r.id).join(", ");
  }
  diagResult.textContent = txt;
}

function saveCustom() {
  chrome.storage.local.set({
    x2tCustom: { top: colorTop.value, bottom: colorBottom.value, accent: colorAccent.value }
  });
}

chrome.storage.local.get(
  ["x2tMode", "x2tFilter", "x2tArt", "x2tBusy", "x2tHideDisaster", "x2tHideFood", "x2tHideAiHype", "x2tHideGov", "x2tHideNews", "x2tHideTrends", "x2tHideFin", "x2tHideInsult", "x2tStrength", "x2tSplash", "x2tBirds", "x2tLang", "x2tCustom", "x2tWallpaperUrl", "x2tWallpaperOn", "x2tTimerEnd", "x2tTimerDone", "x2tTimerSound"],
  ({ x2tMode, x2tFilter, x2tArt, x2tBusy, x2tHideDisaster, x2tHideFood, x2tHideAiHype, x2tHideGov, x2tHideNews, x2tHideTrends, x2tHideFin, x2tHideInsult, x2tStrength, x2tSplash, x2tBirds, x2tLang, x2tCustom, x2tWallpaperUrl, x2tWallpaperOn, x2tTimerEnd, x2tTimerDone, x2tTimerSound }) => {
    render(x2tLang || x2tDetectLang());
    setActive(x2tMode || "auto");
    setStrength(x2tStrength || "standard");
    filterToggle.checked = !!x2tFilter;
    artToggle.checked = !!x2tArt;
    busyToggle.checked = !!x2tBusy;
    disasterToggle.checked = x2tHideDisaster !== false;
    foodToggle.checked = x2tHideFood !== false;
    aiHypeToggle.checked = x2tHideAiHype !== false;
    hideGovToggle.checked = !!x2tHideGov;
    hideNewsToggle.checked = !!x2tHideNews;
    hideTrendsToggle.checked = !!x2tHideTrends;
    hideFinToggle.checked = !!x2tHideFin;
    hideInsultToggle.checked = !!x2tHideInsult;
    splashToggle.checked = x2tSplash !== false;
    birdsToggle.checked = x2tBirds !== false;
    const c = x2tCustom && x2tCustom.top ? x2tCustom : DEFAULT_CUSTOM;
    colorTop.value = c.top;
    colorBottom.value = c.bottom;
    colorAccent.value = c.accent;
    wallpaperToggle.checked = x2tWallpaperOn !== false;
    wallpaperUrl.value = x2tWallpaperUrl || "";
    timerSound.checked = x2tTimerSound !== false;
    if (x2tTimerDone) {
      timerDisplay.textContent = "00:00:00";
      document.body.classList.add("timer-done");
      timerStatus.textContent = x2tText(currentLang, "timerDoneLabel");
    } else if (x2tTimerEnd && x2tTimerEnd > Date.now()) {
      updateTimer(x2tTimerEnd);
      document.body.classList.add("timer-running");
    }
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

busyToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tBusy: busyToggle.checked });
});

disasterToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideDisaster: disasterToggle.checked });
});

foodToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideFood: foodToggle.checked });
});

aiHypeToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideAiHype: aiHypeToggle.checked });
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

hideInsultToggle.addEventListener("change", () => {
  chrome.storage.local.set({ x2tHideInsult: hideInsultToggle.checked });
});

for (const b of strengthButtons) {
  b.addEventListener("click", () => {
    chrome.storage.local.set({ x2tStrength: b.dataset.strength });
    setStrength(b.dataset.strength);
    if (lastDiag) runSelfCheck();
  });
}

function currentSettings() {
  return {
    filterOn: filterToggle.checked,
    hideInsult: hideInsultToggle.checked,
    hideDisaster: disasterToggle.checked,
    hideFood: foodToggle.checked,
    hideAiHype: aiHypeToggle.checked,
    hideGov: hideGovToggle.checked,
    hideNews: hideNewsToggle.checked,
    hideFin: hideFinToggle.checked,
    art: artToggle.checked,
  };
}

function runSelfCheck() {
  if (typeof X2TSelfCheck === "undefined") return;
  renderDiag(X2TSelfCheck.run(currentSettings(), currentStrength));
}

diagRun.addEventListener("click", runSelfCheck);

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

timerPresets.forEach((b) => {
  b.addEventListener("click", () => {
    startTimer(parseInt(b.dataset.min, 10) * 60000);
  });
});

timerStart.addEventListener("click", () => {
  const min = parseInt(timerCustom.value, 10);
  if (!min || min < 1) return;
  startTimer(min * 60000);
});

timerStop.addEventListener("click", stopTimer);

timerDisplay.addEventListener("click", stopTimer);

timerSound.addEventListener("change", () => {
  chrome.storage.local.set({ x2tTimerSound: timerSound.checked });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.x2tTimerDone && changes.x2tTimerDone.newValue) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = "00:00:00";
    document.body.classList.remove("timer-running");
    document.body.classList.add("timer-done");
    timerStatus.textContent = x2tText(currentLang, "timerDoneLabel");
  }
  if (changes.x2tTimerEnd && changes.x2tTimerEnd.newValue) {
    updateTimer(changes.x2tTimerEnd.newValue);
    document.body.classList.add("timer-running");
    document.body.classList.remove("timer-done");
  }
});
