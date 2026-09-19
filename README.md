# 🐦 X to Twitter 2

> A Chrome extension that brings x.com back to the nostalgic "gentle Twitter".
> It restores the blue bird as the tab icon and logo, rewrites every "X" into "Twitter 2", and bundles a startup splash, ambient background effects, and a fully-local negative-news / AI-alarmist word filter. A fan-made mod.
> **v1.8** adds inverted **"hide" toggles** (disaster & rescue info / food & gourmet) and an **AI-alarmist filter** — all running locally with no API, no dependencies, and no data leaving your browser.

![version](https://img.shields.io/badge/version-1.8.3-blue)

---

## ✨ Key Features

### 1. Bring the "Twitter" brand back
- **Tab icon / favicon** → the original Twitter blue bird (#1DA1F2)
- **Top-left X logo** → replaced with a blue bird (falls back to an overlaid bird if the logo can't be swapped)
- Every **"X" / "𝕏"** on the page → rewritten to **"Twitter 2"**
- **"x.com"** → written as **"twitter.com"**
- The browser tab title → also rewritten to **"Twitter 2"**

### 2. Startup splash
- When x.com opens, a pulsing blue-bird splash appears, then gives way to the normal page (can be toggled)

### 3. Custom colors & wallpaper 🎨
- **Custom colors**: in "Custom" background mode you can freely set the background top/bottom colors and the bird (accent) color. One-tap presets are available (Sky / Night sky / Sakura / Mint / Citrus)
- **Wallpaper**: set any image URL as the background wallpaper (toggle on/off). Build your own Midnight Lizard-style theme

### 4. Gentle UI touches
- Tweets lift slightly with a shadow on hover
- Profile images glow blue and scale up on hover
- 16px rounded cards, blue selection color
- **Pressing Home auto-scrolls to the top of the timeline** (smooth)

### 5. Background modes (auto-follow)
- **Auto** (default): follows X's own theme (light/dark)
- **Light**: old-Twitter style light blue gradient
- **Dark**: old-Twitter dark navy gradient
- **Custom**: freely customize background colors (top/bottom) and the bird color
- **Lazy floating birds** that drift and bob with a gentle wingbeat in the margins (toggleable, and disabled under `prefers-reduced-motion`)

### 6. Negative-news filter 🛡️
When the toggle is ON, the following are hidden from the **home timeline** (`/home`) — the filter is **not applied on search results**:
  - **Politics (Japan & worldwide)** (elections, parliament, leaders, political terms, etc.)
  - **Conspiracy theories** (vaccines, disinformation, QAnon, etc.)
  - **War & conflict** (Ukraine, Gaza, missiles, etc.)
  - **Conflict-region country names** (Afghanistan, Iraq, Syria, Yemen, Sudan, Myanmar, Taiwan, South China Sea, etc.)
  - **NAFO-related** (NAFO, fella army, etc.)
  - **Worldwide presidents / leaders / historical figures** (US presidents, Hitler/Stalin/Mao, bin Laden, Putin, etc. Common surnames need 2 hits to avoid false positives)
  - **News abbreviations & FX** (為替/FX, Japan-US, Russian/French/UK/German/Chinese government shorthand, etc. Single-character abbreviations use 2-hit detection to avoid false positives)
  - **Fires, accidents, disasters**
  - **Unfortunate news** (incidents, crimes, obituaries, etc.)
  - **Quarrels & defamation** (confrontation, controversy, flame wars, harassment, etc.)
  - **Negative emotional reactions** (rage, murderous intent, hatred, disgust, condescension, mounting, irritation, etc.)
  - **Criticism that uses Japan as the subject** ("日本では / 日本人が / this country…" + a criticism keyword combined)
  - **AI panic & incitement** (anti-AI, AI takeover/collapse, deepfake, incitement, fearmongering, disinformation, brainwashing, etc. SOS/help posts are excluded)
  - **AI controversy** (AI art, generative AI, AI plagiarism, unauthorized training, pro/con AI debates, etc.)
- **Data-driven detection**: 2-stage — strong signals (1 hit hides) and weak signals (2+ hits hide)
- **Covers almost all bad news**: murders, incidents, crimes, accidents, disasters, politics, war, conflict, cyberattacks (unauthorized access, data leaks), terrorism, FX, international affairs
- **Animal posts are allowed**: cats, dogs, zoos, pets, rescue efforts, aquariums — animal-related posts are exempt from the filter (protecting your peace)
- **Japanese media/newspapers are allowed**: Asahi, Yomiuri, Mainichi, Nikkei, Sankei, Kyodo, Jiji, NHK, local papers, TV stations — official media posts are always shown. However, disaster casualty/damage reports (deaths, bodies, critical conditions — emotionally heavy content) stay hidden even from media accounts
- **Multilingual**: all Japanese filter words are translated into English; detection works in both Japanese and English
- **Kindness**: "safe / uninjured / rescued" type posts are never hidden; SOS and venting posts are intentionally exempt

### 7. Zero-cost & fully local 🔒
Every filter decision is made **inside your browser** with word lists and regular expressions.

- **No API, no account, no key** — nothing is sent anywhere and nothing costs money
- Works offline and never rate-limits
- Add or remove words by editing `filters.js` (`DISASTER_SIGNAL`, `FOOD_SIGNAL`, `AI_HYPE_SIGNAL`, etc.)

---

## 📦 Installation (Chrome Extension)

1. **Download the zip** → get the latest `x2twitter.zip` from the repo's **Release page**
2. Unzip it (e.g. `~/Downloads/x2twitter/`)
3. Open `chrome://extensions` in Chrome
4. Turn on **Developer mode** (top-right)
5. Click **Load unpacked** (top-left)
6. Select the extracted **`x2twitter` folder**
7. Once enabled, **open x.com** 🎉

### To update
1. Click the extension's **reload** (🔄) button on `chrome://extensions`
2. Changes are applied

---

## 🎛️ Usage

### 🎨 Art Focus Mode (special toggle · top of the popup)
Click the extension icon → turn on **Art Focus Mode** (top) to focus the timeline on **text-light image posts with likes/RTs**
- Keeps only posts with an image, 5+ likes/RTs, and short text (≤200 chars); other noise is hidden
- Your own posts, animal/comfort posts, and posts allowed by Disaster/Food modes stay visible
- Also matches art keywords (絵/illustration/art, fanart, etc.)

### 🔕 Busy Mode (special toggle)
Click the extension icon → turn on **Busy Mode (hide notifications)** and the **blue count badges on the Bell (notifications) and DMs disappear**, and the **browser tab notification count (e.g. "(3)") is hidden too**
- Perfect for when you want to focus or are bothered by notifications

### ⏰ Posting timer (algorithm-optimized)
Click the extension icon → use the **Posting timer** at the top of the popup
- One-tap presets: **1h / 2h / 3h / 6h / 12h / 24h**, or enter custom minutes
- A gentle **chime plays when the timer finishes** (toggleable), even if the popup is closed
- The countdown keeps running in the background (via `chrome.alarms`) and survives popup close/reopen
- Why these intervals? Repeated identical posts in a short window can look spammy to the algorithm — spacing out similar posts by **3–6+ hours** is the recommended rhythm
- Click the countdown to stop/reset the timer

### Background mode switching
Click the extension icon (🐦) → choose **Auto / Light / Dark / Custom** under "Background mode"

### Negative-news filter
Click the extension icon → toggle **Hide negative news**
- ON: matching tweets are instantly hidden on the **home timeline** (auto-follows new posts as you scroll)
- OFF: everything shows again
- **Your own account's posts are completely exempt** (they never get hidden, even with the filter ON)
- The filter is **not applied on search results** (`/search`) so search results never disappear

### Don't show disaster & rescue info
Turn on **Don't show disaster & rescue info** to hide **earthquakes, evacuations, rescue, safety checks, aid, donations, etc.** from the timeline
- This is a **"hide" toggle** (inverted from v1.7): ON means you do **not** want to see disaster/support posts
- Emotionally heavy expressions (deaths, bodies, critical conditions) stay hidden as before
- Word-list based (no API): matched via `DISASTER_SIGNAL` in `filters.js`

### Don't show food & gourmet
Turn on **Don't show food & gourmet** to hide food posts (meals, cooking, ramen, sweets, recipes, "I'm hungry", etc.)
- This is a **"hide" toggle** (inverted from v1.7): ON means you do **not** want to see food/gourmet posts
- Word-list based (no API): matched via `FOOD_SIGNAL` in `filters.js`; ambiguous words like そば/パン/カレー are deliberately excluded to avoid false positives
- Posts containing emotionally heavy expressions (deaths, bodies, critical conditions) stay hidden

### Hide AI alarmists (Japan & worldwide)
Turn on **Hide AI alarmists** to hide sensational "AI scaremonger" posts — AGI-doom, "humanity ends", "singularity is here", "AI will take every job", and similar unfounded panic/hype
- Word-list based (no API): matched via `AI_HYPE_SIGNAL` in `filters.js`, limited to alarmist/doom phrasing rather than the word "AI" itself
- Works for both Japanese and English posts

### Effects toggles
- **Splash**: the blue-bird splash on page load (default ON)
- **Birds**: floating birds in the margins (default ON)

### Account hiding 🏛️📰
- **Hide gov & politician accounts**: completely hide government agencies, heads of state, and politicians worldwide (@POTUS, @kantei, @10DowningStreet, etc.)
- **Hide news accounts**: completely hide news & newspaper accounts worldwide (@nhk_news, @CNN, @Reuters, etc.)
- **Hide trends**: hide the right-side trends panel ("Trending now" / "トレンド")
- **Hide finance accounts**: completely hide finance/economy media, central banks, and crypto media (@WSJ, @Bloomberg, @nikkei, @Cointelegraph, etc.)
- **Hide abuse & insults**: hide replies/posts containing insults (死ね "die", カス "scum", ゴミ野郎 "trash", ハゲ "baldy", パクリ "plagiarism", "AIかよ", fuck, idiot, piece of shit, etc.) — works in Japanese & English
- Your own account's posts are always exempt. The account lists live in `filters.js` under `GOV_ACCOUNTS` / `NEWS_ACCOUNTS` / `FIN_ACCOUNTS`

All settings are saved automatically and persist across sessions.

---

## ⚙️ Specs

| Item | Details |
|---|---|
| Type | Chrome Extension (Manifest V3) |
| Target sites | `*.x.com/*`, `*.twitter.com/*` |
| Permissions | `storage`, `alarms`, `offscreen` (no network access at all) |
| Runtime | None (no dependencies, plain JS) |
| Files | `manifest.json` / `filters.js` / `i18n.js` / `content.js` / `popup.html` / `popup.js` / `background.js` / `offscreen.html` / `offscreen.js` / `icons/` |

### Tech notes
- **Text rewriting**: a `MutationObserver` follows the SPA's dynamic content. Inputs, textareas, and contenteditable elements are left untouched so composing tweets never breaks
- **Logo**: the X logo SVG is hidden via CSS (visibility) and a blue bird is layered on top from the extension's own body layer — no structural changes to React's DOM (avoids breaking X's rendering)
- **Home auto-scroll**: clicking Home or the logo smooth-scrolls to the top of the timeline
- **Background**: a gradient is applied to `html`, the body is transparent, and birds float on a fixed `z-index:-1` layer in the margins only
- **UI text**: the popup's "Language" switch lets you choose Japanese or English manually (other languages are not supported; falls back to the OS language if unset)

---

## 📁 Repository structure

```
x2twitter/
├── manifest.json      # Extension definition (Manifest V3)
├── background.js      # Posting-timer alarm + chime playback
├── filters.js         # Filter word definitions (strong/weak signals, exceptions, regexes, account lists)
├── i18n.js            # UI text (Japanese/English) and language detection
├── content.js         # Main logic (rewrite, effects, filter application)
├── popup.html         # Extension popup UI
├── popup.js           # Popup control
├── offscreen.html     # Chrome offscreen doc (timer chime audio)
├── offscreen.js       # Offscreen chime player
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
# Manual test: chrome://extensions → Load unpacked
# Create a zip, e.g.
cd x2twitter && zip -r ../x2twitter.zip . -x "*.DS_Store"
```

### Customization
- Filter words can be edited in `filters.js` in the `STRONG_JP` / `STRONG_EN` / `WEAK_JP` / `WEAK_EN` arrays (ambiguous common words such as conflict, fight, strike, fire, shelter, fake, flu, vaccine are weak-signal by default)
- Background colors, splash, and animations can be adjusted in the template strings in `content.js`
- UI text can be edited in `X2T_I18N` inside `i18n.js` (Japanese / English)

---

## ⚠️ Notes

- This is a **browser extension** that hooks into page rendering in your browser. It **does not access or modify X (formerly Twitter)'s internal systems, servers, or data in any way — all processing happens locally inside your browser**
- **Completely offline for filtering**: no API key, no network requests, no usage cost. Word lists live in `filters.js`
- An **unofficial add-on** with no affiliation to X (formerly Twitter)
- Because page structures change, behavior may break
- Rewriting "X" into "Twitter 2" can occasionally change text you didn't intend
- Commercial use / redistribution is at your own risk

---

## 📄 License

MIT

---

*This project started from the wish that "small children shouldn't have to watch adults tearing each other apart." Here's to bringing back a gentle Twitter on X.*
