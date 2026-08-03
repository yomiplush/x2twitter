# 🐦 X to Twitter 2

> A Chrome extension that brings back the nostalgic "gentle Twitter" to x.com.
> Replaces the tab icon and logo with the blue bird, rewrites every "X" as "Twitter 2", and bundles a startup splash, ambient background effects, and a negative-news filter.

![version](https://img.shields.io/badge/version-1.0.0-blue)

---

## ✨ Features

### 1. Bring the "Twitter" brand back
- **Tab icon / favicon** restored to the official Twitter blue bird (#1DA1F2)
- **Top-left X logo** replaced with the blue bird (falls back to overlaying a bird if the SVG can't be swapped)
- Every **"X" / "𝕏"** on the page rewritten to **"Twitter 2"**
- "x.com" text is rewritten to "twitter.com"
- Browser tab title becomes "Twitter 2"

### 2. Startup splash
- Opening x.com shows a pulsing blue bird centered on a blue gradient, then fades out to the normal screen

### 3. Crossfade page transitions
- Clicking a link or a left-menu item softly dims the main column, then fades it back in once the new content mounts

### 4. Gentle UI effects
- Tweet cards lift with a soft shadow on hover
- Profile images get a blue glow and slight zoom on hover
- 16px rounded cards, smooth scrolling, blue selection color

### 5. Background modes (auto-follow)
- **Auto** (default): matches the site's own light/dark theme
- **Light**: old-Twitter style light blue gradient
- **Dark**: old-Twitter dark navy gradient
- Gentle "floating" and "flying" bird animations drift in the margins as ambient effects

### 6. Negative-news filter 🛡️
- Toggle ON to hide from the timeline:
  - **Politics — Japan and worldwide** (elections, parliament, heads of state, global political terms, etc.)
  - **Conspiracy theories** (vaccines, misinformation, QAnon, etc.)
  - **War & conflict** (Ukraine, Gaza, missiles, etc.)
  - **Fires, accidents, disasters**
  - **Unfortunate news** (crimes, arrests, obituaries, etc.)
  - **Arguments & harassment** (confrontation, disputes, flame wars, harassment, etc.)
- **Data-driven detection**: strong signals (hide on 1 hit) and weak signals (hide on 2+ hits)
- **Kindness by design**: posts containing "no injuries / everyone is safe / rescued" are kept, and mental-health SOS posts are intentionally never filtered

---

## 📦 Installation (Chrome extension)

1. **Download the zip** → grab the latest `x2twitter.zip` from the **Releases** page
2. Extract it (e.g. into `~/Downloads/x2twitter/`)
3. Open `chrome://extensions` in Chrome
4. Turn on **Developer mode** (top-right)
5. Click **Load unpacked** (top-left)
6. Select the extracted **`x2twitter` folder**
7. Once enabled, open **x.com** 🎉

### Updating
1. On `chrome://extensions`, click the **Reload** (🔄) button for the extension
2. Changes take effect immediately

---

## 🎛️ Usage

### Background mode
Click the extension icon (🐦) → choose **Auto / Light / Dark** under *Background mode*

### Negative-news filter
Click the extension icon → toggle **Hide negative news**
- ON: matching tweets are hidden instantly (new tweets appearing on scroll are filtered automatically)
- OFF: everything is shown again

Settings are saved automatically and persist across sessions.

---

## ⚙️ Specifications

| Item | Details |
|---|---|
| Type | Chrome Extension (Manifest V3) |
| Target sites | `*.x.com/*`, `*.twitter.com/*` |
| Permissions | `storage` only (no data collection) |
| Runtime | None (no dependencies, pure vanilla JS) |
| Files | `manifest.json` / `content.js` / `popup.html` / `popup.js` / `icons/` / `_locales/` |

### Technical notes
- **Text rewriting**: uses a `MutationObserver` to follow SPA dynamic content. Input fields, `textarea`s and `contenteditable` areas are never rewritten (your tweets stay intact)
- **Logo swap**: detects the X logo SVG path (`M18.244...`) and replaces it with the blue bird; falls back to overlaying an absolutely-positioned bird if the swap is impossible
- **Page transitions**: pseudo-crossfade via `primaryColumn` opacity control + overlay + `pushState`/`popstate` monitoring
- **Background**: gradient on `html`, transparent `body`, and animated birds on a fixed `z-index:-1` layer so they only show in the margins
- **i18n**: language auto-switches to match the OS locale (Japanese / English fallback)

---

## 📁 Repository layout

```
x2twitter/
├── manifest.json      # Extension manifest (Manifest V3)
├── content.js         # Main logic (rewriting, effects, filter)
├── popup.html         # Extension popup UI
├── popup.js           # Popup controls
├── _locales/
│   ├── ja/messages.json
│   └── en/messages.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── bird.svg       # Original blue-bird SVG
└── README.md
```

---

## 🧑‍💻 For developers

```bash
# Manual testing: chrome://extensions → "Load unpacked"
# Build the zip
cd x2twitter && zip -r ../x2twitter.zip . -x "*.DS_Store"
```

### Customization
- Filter keywords live in the `STRONG_JP` / `STRONG_EN` / `WEAK_JP` / `WEAK_EN` arrays in `content.js`
- Background colors, splash and transition animations are template strings in `content.js`
- UI strings live in `_locales/ja/messages.json` and `_locales/en/messages.json`

---

## ⚠️ Disclaimer

- This is an **unofficial fan-made extension** and is not affiliated with X (formerly Twitter)
- Page-structure changes by X may break parts of the extension
- Because "X" is rewritten to "Twitter 2", some unintended text changes may occur
- Use and redistribution are at your own risk

---

## 📄 License

MIT

---

*Built from a wish: "Kids shouldn't have to watch adults tear each other apart." This project brings the gentle Twitter back to X.*
