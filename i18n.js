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
    splashSub: "優しいTwitterへ、ようこそ",
    timerLabel: "投稿タイマー（アルゴリズム最適化）",
    timerSoundLabel: "完了時に効果音",
    timerStartLabel: "開始",
    timerStopLabel: "停止",
    timerDoneLabel: "投稿タイマー完了！投稿の時間にゃ 🐦",
    timerNote: "同じ内容の連投はスパム判定されやすいにゃ。同じ系統の投稿は3〜6時間以上空けるのがおすすめにゃ！",
    timerPreset1h: "軽い投稿・別の話題ならOKにゃ",
    timerPreset2h: "少し変化のある投稿向けにゃ",
    timerPreset3h: "同じ系統の投稿の最低限の間隔にゃ",
    timerPreset6h: "同じ内容の投稿に理想的な間隔にゃ",
    timerPreset12h: "半日ペース・じっくり投稿にゃ",
    timerPreset24h: "1日1回ペース・最も安全にゃ"
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
    splashSub: "Welcome back to the gentle Twitter",
    timerLabel: "Posting timer (algorithm-optimized)",
    timerSoundLabel: "Sound on completion",
    timerStartLabel: "Start",
    timerStopLabel: "Stop",
    timerDoneLabel: "Timer done! Time to post 🐦",
    timerNote: "Repeated identical posts can look spammy. Space out similar posts by 3-6+ hours!",
    timerPreset1h: "OK for light posts or different topics",
    timerPreset2h: "Good for posts with some variation",
    timerPreset3h: "Minimum spacing for similar posts",
    timerPreset6h: "Ideal spacing for identical posts",
    timerPreset12h: "Half-day pace, take it slow",
    timerPreset24h: "Once-a-day pace, the safest"
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
