// ============================================================
// selfcheck.js — フィルターの自己診断（日本語 / English）
// ============================================================
// ビルトインのサンプル投稿を実際の判定ロジック（filters.js の x2tCategories）
// にかけて、期待どおり「隠す / 見せる」になるかを自己採点する。
// 外部APIは使わない。ポップアップの「自己診断」ボタンから実行する。
//
// 公開API: window.X2TSelfCheck = { run(settings, strength), cases() }
(() => {
  "use strict";

  // lang: ja / en, hide: 期待する最終判定（下の設定で隠すべきか）, cats: 期待カテゴリ
  const CASES = [
    // ===== 日本語 =====
    { id: "ja_politics", lang: "ja",
      text: "政府は増税法案を可決した。反発が広がっている",
      hide: true, cats: { negative: true } },
    { id: "ja_war", lang: "ja",
      text: "ウクライナでミサイル攻撃、住宅街が被害",
      hide: true, cats: { negative: true } },
    { id: "ja_weak_news", lang: "ja",
      text: "この決定には批判が殺到し、物議を醸している",
      hide: true, cats: { negative: true } },
    { id: "ja_disaster_support", lang: "ja",
      text: "地震で停電しています。避難所は〇〇小学校。支援物資をお願いします",
      hide: true, cats: { disaster: true } },
    { id: "ja_disaster_emotional", lang: "ja",
      text: "被災地で死者が確認されました。遺族が悲しみに暮れています",
      hide: true, cats: { negative: true, disaster: false } },
    { id: "ja_food", lang: "ja",
      text: "今日のラーメンが最高。スープが濃厚で麺がもちもち",
      hide: true, cats: { gourmet: true } },
    { id: "ja_ai_hype", lang: "ja",
      text: "ついにAGIが完成。人類は終わる。シンギュラリティは来た",
      hide: true, cats: { aiHype: true } },
    { id: "ja_insult", lang: "ja",
      text: "お前はカスでゴミ野郎だ。消えろ",
      hide: true, cats: { insult: true } },
    { id: "ja_ai_news", lang: "ja",
      text: "OpenAIが新しいモデルを発表。ベンチマークが大きく向上した",
      hide: false, cats: { negative: false, aiHype: false, gourmet: false } },
    { id: "ja_ai_art", lang: "ja",
      text: "AIで描いたイラストがこちらです。気に入ってます",
      hide: false, cats: { negative: false, aiHype: false } },
    { id: "ja_animal", lang: "ja",
      text: "保護猫の里親募集中です。元気な子猫です",
      hide: false, cats: { negative: false, gourmet: false, disaster: false } },
    { id: "ja_positive", lang: "ja",
      text: "今日もいい天気ですね。おはようございます",
      hide: false, cats: { negative: false, disaster: false, gourmet: false, aiHype: false } },
    { id: "ja_generic_share", lang: "ja",
      text: "この便利な情報、みんなと共有しておきますね",
      hide: false, cats: { disaster: false } },
    { id: "ja_pants", lang: "ja",
      text: "新しいパンツを買いました",
      hide: false, cats: { gourmet: false } },
    { id: "ja_soba_near", lang: "ja",
      text: "あなたのそばにいるよ",
      hide: false, cats: { gourmet: false } },

    // ===== English =====
    { id: "en_politics", lang: "en",
      text: "The government just passed a huge tax hike. Voters are furious",
      hide: true, cats: { negative: true } },
    { id: "en_war", lang: "en",
      text: "Missile attack hits residential area, dozens injured",
      hide: true, cats: { negative: true } },
    { id: "en_disaster", lang: "en",
      text: "Earthquake evacuation: shelter open at the school, supplies available",
      hide: true, cats: { disaster: true } },
    { id: "en_food", lang: "en",
      text: "Best ramen in town, the broth is so rich and the noodles are chewy",
      hide: true, cats: { gourmet: true } },
    { id: "en_ai_hype", lang: "en",
      text: "AGI is here. Humanity is doomed. The singularity has arrived",
      hide: true, cats: { aiHype: true } },
    { id: "en_insult", lang: "en",
      text: "You are garbage and you should die, idiot",
      hide: true, cats: { insult: true } },
    { id: "en_ai_news", lang: "en",
      text: "OpenAI announced a new model with better benchmarks",
      hide: false, cats: { negative: false, aiHype: false } },
    { id: "en_ai_art", lang: "en",
      text: "Here is a digital art piece I painted this week",
      hide: false, cats: { negative: false, aiHype: false, gourmet: false } },
    { id: "en_animal", lang: "en",
      text: "Adoptable rescue kittens looking for a home",
      hide: false, cats: { negative: false, gourmet: false, disaster: false } },
    { id: "en_positive", lang: "en",
      text: "Good morning everyone, such a nice sunny day",
      hide: false, cats: { negative: false, disaster: false, gourmet: false, aiHype: false } },
    { id: "en_vegetable", lang: "en",
      text: "Growing tomatoes in my garden this year",
      hide: false, cats: { gourmet: false } },
  ];

  const DEFAULT_SETTINGS = {
    filterOn: true,
    hideGov: true,
    hideNews: true,
    hideFin: true,
    hideInsult: true,
    hideDisaster: true,
    hideFood: true,
    hideAiHype: true,
    art: false,
  };

  function decide(text, s) {
    const c = x2tCategories(text);
    if (s.hideInsult && c.insult) return { hide: true, by: "insult", cats: c };
    if (s.hideDisaster && c.disaster) return { hide: true, by: "disaster", cats: c };
    if (s.hideFood && c.gourmet) return { hide: true, by: "gourmet", cats: c };
    if (s.hideAiHype && c.aiHype) return { hide: true, by: "aiHype", cats: c };
    if (s.filterOn && c.negative) return { hide: true, by: "negative", cats: c };
    return { hide: false, by: null, cats: c };
  }

  // settings を省略すると標準設定。strength を渡すと弱シグナルのしきい値を切替。
  function run(settings, strength) {
    const s = Object.assign({}, DEFAULT_SETTINGS, settings || {});
    if (strength) x2tSetStrength(strength);
    else x2tSetStrength("standard");

    const results = [];
    let passed = 0;
    for (const c of CASES) {
      const d = decide(c.text, s);
      let ok = d.hide === c.hide;
      // カテゴリ期待値も照合（指定されたものだけ）
      if (ok && c.cats) {
        for (const k of Object.keys(c.cats)) {
          if (!!d.cats[k] !== !!c.cats[k]) { ok = false; break; }
        }
      }
      if (ok) passed++;
      results.push({ id: c.id, lang: c.lang, ok, want: c.hide, got: d.hide, by: d.by, cats: d.cats });
    }
    const total = CASES.length;
    return {
      total,
      passed,
      failed: total - passed,
      accuracy: total ? passed / total : 1,
      strength: strength || "standard",
      results,
    };
  }

  function cases() { return CASES.slice(); }

  globalThis.X2TSelfCheck = { run, cases, DEFAULT_SETTINGS };
})();
