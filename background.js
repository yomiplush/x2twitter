const TIMER_ALARM = "x2tPostTimer";

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== TIMER_ALARM) return;
  chrome.storage.local.set({ x2tTimerEnd: null, x2tTimerDone: true });
  chrome.storage.local.get(["x2tTimerSound"], ({ x2tTimerSound }) => {
    if (x2tTimerSound === false) return;
    playChime();
  });
});

function playChime() {
  if (typeof chrome.offscreen !== "undefined") {
    chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play posting timer chime"
    }).then(() => {
      chrome.runtime.sendMessage({ type: "playChime" });
    }).catch(() => {});
  } else if (typeof window !== "undefined") {
    playTone();
  }
}

function playTone() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1108.73, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  } catch (e) {}
}