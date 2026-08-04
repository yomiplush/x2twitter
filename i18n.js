const X2T_I18N = {
  ja: {
    headTagline: "優しいTwitterへ、ようこそ",
    bgLabel: "背景モード",
    bgAuto: "自動",
    bgLight: "ライト",
    bgDark: "ダーク",
    bgCustom: "カスタム",
    customLabel: "カスタムカラー",
    colorTop: "背景（上）",
    colorBottom: "背景（下）",
    colorAccent: "鳥の色",
    wallpaperLabel: "壁紙画像",
    wallpaperOnLabel: "壁紙を表示",
    filterLabel: "ネガティブニュースを隠す",
    disasterLabel: "災害・救難支援情報を見る",
    splashLabel: "スプラッシュ演出",
    birdsLabel: "鳥の演出",
    langLabel: "表示言語",
    footNote: "ブラウザ内のみで動作",
    splashSub: "優しいTwitterへ、ようこそ"
  },
  en: {
    headTagline: "Welcome back to the gentle Twitter",
    bgLabel: "Background mode",
    bgAuto: "Auto",
    bgLight: "Light",
    bgDark: "Dark",
    bgCustom: "Custom",
    customLabel: "Custom colors",
    colorTop: "Background (top)",
    colorBottom: "Background (bottom)",
    colorAccent: "Bird color",
    wallpaperLabel: "Wallpaper",
    wallpaperOnLabel: "Show wallpaper",
    filterLabel: "Hide negative news",
    disasterLabel: "Show disaster & rescue info",
    splashLabel: "Splash animation",
    birdsLabel: "Floating birds",
    langLabel: "Language",
    footNote: "Runs locally in your browser",
    splashSub: "Welcome back to the gentle Twitter"
  }
};

function x2tDetectLang() {
  try {
    const nl = (navigator.language || "en").toLowerCase();
    if (nl.startsWith("ja")) return "ja";
    if (nl.startsWith("en")) return "en";
  } catch (e) {}
  return "en";
}

function x2tText(lang, key) {
  const table = X2T_I18N[lang] || X2T_I18N.ja;
  return table[key] || key;
}
