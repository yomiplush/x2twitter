const X2T_I18N = {
  ja: {
    headTagline: "優しいTwitterへ、ようこそ",
    bgLabel: "背景モード",
    bgAuto: "自動",
    bgLight: "ライト",
    bgDark: "ダーク",
    bgCustom: "カスタム",
    artLabel: "アート集中モード（画像×いいね）",
    busyLabel: "Busy Mode（通知を隠す）",
    customLabel: "カスタムカラー",
    colorTop: "背景（上）",
    colorBottom: "背景（下）",
    colorAccent: "鳥の色",
    wallpaperLabel: "壁紙画像",
    wallpaperOnLabel: "壁紙を表示",
    filterLabel: "ネガティブニュースを隠す",
    disasterLabel: "災害・救難支援情報を見る",
    foodLabel: "食べ物・グルメを見る",
    hideGovLabel: "政府・政治家アカウントを隠す",
    hideNewsLabel: "ニュースアカウントを隠す",
    hideTrendsLabel: "トレンドを隠す",
    hideFinLabel: "金融アカウントを隠す",
    hideInsultLabel: "暴言・誹謗を隠す",
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
    artLabel: "Art focus mode (image × likes)",
    busyLabel: "Busy Mode (hide notifications)",
    customLabel: "Custom colors",
    colorTop: "Background (top)",
    colorBottom: "Background (bottom)",
    colorAccent: "Bird color",
    wallpaperLabel: "Wallpaper",
    wallpaperOnLabel: "Show wallpaper",
    filterLabel: "Hide negative news",
    disasterLabel: "Show disaster & rescue info",
    foodLabel: "Show food & meals",
    hideGovLabel: "Hide gov & politician accounts",
    hideNewsLabel: "Hide news accounts",
    hideTrendsLabel: "Hide trends",
    hideFinLabel: "Hide finance accounts",
    hideInsultLabel: "Hide abuse & insults",
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
