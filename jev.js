// ============================================================
// jev.js — Jev（TypeSafe）意思決定レイヤー for X to Twitter 2
// ============================================================
// content.js より先に読み込まれる。window.X2TJev を公開する。
//
// Jev はチャットモデルではなく「型付きの判断」を返す意思決定モデル。
// ここではタイムライン上の投稿本文を state として渡し、
//   ・negative  : 読むと気分が沈むネガティブニュースか（noul: 0..1）
//   ・disaster  : 災害の避難・救助・支援情報か（noul: 0..1）
//   ・gourmet   : 実際の食べ物・グルメ情報か（noul: 0..1）
// の確率だけを取得する。表示/非表示のポリシー決定は content.js（コード側）が持つ。
//
// 設計の要点:
//   - どのカテゴリを尋ねるかは呼び出し側が指定（不要な推論をしない＝コスト削減）
//   - 本文テキストでキャッシュし、同じ投稿を何度も推論しない
//   - 同時リクエスト数を制限し、429/529 は指数バックオフで再試行
//   - キー未設定・失敗時は null を返し、呼び出し側は正規表現フォールバックに戻れる
(() => {
  "use strict";

  // OpenRouter の TypeSafe Jev エンドポイント（JEV MCP と同じ形）
  const DEFAULT_BASE = "https://openrouter.ai";
  const DEFAULT_MODEL = "~typesafe/jev-latest";
  const ENDPOINT_PATH = "/api/alpha/decisions";

  const MAX_RETRIES = 3;

  // カテゴリごとの日本語プロンプト（TypeSafe docs の noul + criteria 形式）
  const NEGATIVE_Q = {
    type: "noul",
    instructions:
      "この投稿は、読者がタイムラインで見ると気分が沈む『ネガティブニュース』ですか？ " +
      "対象: 政治・選挙・戦争・紛争・事件・犯罪・事故・災害の被害・訃報・誹謗中傷・炎上・" +
      "AI/生成AIをめぐる論争や不安を煽る話題。 " +
      "対象外: 前向きな報告、日常、芸術、動物、食べ物、防災の備え、単なる挨拶、冗談。",
    criteria: {
      true: "読むと気分が沈む・不安や怒りを感じさせるニュースや論争",
      false: "前向き・中立・日常・芸術・動物・食べ物・防災の備え・冗談",
    },
  };
  const DISASTER_Q = {
    type: "noul",
    instructions:
      "この投稿は、地震・台風・洪水などの災害に関する、避難所・救助・安否・支援物資・募金・" +
      "復旧・ボランティアなどの支援/救難情報ですか？ " +
      "災害を話題にした比喩や訓練・備えは含めない。",
  };
  const GOURMET_Q = {
    type: "noul",
    instructions:
      "この投稿は、食べ物・料理・グルメ・飲食店・レシピなど、実際の食に関する情報ですか？ " +
      "食べ物を比喩に使った表現や、食べ物を題材にした絵は含めない。",
  };
  const AI_HYPE_Q = {
    type: "noul",
    instructions:
      "この投稿は、AIの能力や脅威を誇張・扇動的に主張して、不安や驚きを煽る『AI驚き屋』の投稿ですか？ " +
      "対象: 『AGIが完成した』『人類滅亡』『シンギュラリティが来た』『AIが全仕事を奪う』など" +
      "根拠薄弱な煽りや終末論。 " +
      "対象外: 客観的なAIニュース、ツール紹介、作品、技術解説、冷静な議論・批評、AI規制の報道、冗談。",
    criteria: {
      true: "AIの脅威や能力を誇張して不安・驚きを煽る扇動的な主張",
      false: "客観的ニュース・ツール紹介・作品・技術解説・冷静な議論・批評・冗談",
    },
  };

  const cache = new Map(); // key -> result | null
  const inflight = new Map(); // key -> Promise

  const cfg = {
    apiKey: "",
    baseUrl: DEFAULT_BASE,
    model: DEFAULT_MODEL,
  };

  function configure(next) {
    if (!next) return;
    if (typeof next.apiKey === "string") cfg.apiKey = next.apiKey.trim();
    if (typeof next.baseUrl === "string" && next.baseUrl.trim()) {
      cfg.baseUrl = next.baseUrl.trim().replace(/\/+$/, "");
    }
    if (typeof next.model === "string" && next.model.trim()) {
      cfg.model = next.model.trim();
    }
  }

  function isReady() {
    return !!cfg.apiKey;
  }

  function signature(text, want) {
    const flags = (want.negative ? "n" : "") + (want.disaster ? "d" : "") +
      (want.gourmet ? "g" : "") + (want.aiHype ? "a" : "");
    return flags + "|" + text;
  }

  function buildQuestions(want) {
    const q = {};
    if (want.negative) q.negative = NEGATIVE_Q;
    if (want.disaster) q.disaster = DISASTER_Q;
    if (want.gourmet) q.gourmet = GOURMET_Q;
    if (want.aiHype) q.aiHype = AI_HYPE_Q;
    return q;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function postOnce(text, questions) {
    const res = await fetch(cfg.baseUrl + ENDPOINT_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + cfg.apiKey,
      },
      body: JSON.stringify({
        model: cfg.model,
        state: { tweet: text },
        questions,
      }),
    });
    if (res.status === 429 || res.status === 529) {
      const err = new Error("retryable " + res.status);
      err.retryable = true;
      throw err;
    }
    if (!res.ok) {
      throw new Error("Jev HTTP " + res.status);
    }
    return res.json();
  }

  async function request(text, want) {
    const questions = buildQuestions(want);
    if (!Object.keys(questions).length) return null;

    let body = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        body = await postOnce(text, questions);
        break;
      } catch (e) {
        if (attempt === MAX_RETRIES || !e.retryable) throw e;
        await sleep(500 * Math.pow(2, attempt));
      }
    }
    if (!body) return null;

    const answers = (body && body.answers) || {};
    const out = { model: body.model || cfg.model, at: Date.now() };
    if (want.negative) out.negative = answers.negative && answers.negative.noul;
    if (want.disaster) out.disaster = answers.disaster && answers.disaster.noul;
    if (want.gourmet) out.gourmet = answers.gourmet && answers.gourmet.noul;
    if (want.aiHype) out.aiHype = answers.aiHype && answers.aiHype.noul;
    return out;
  }

  // text を Jev で判定。want = { negative, disaster, gourmet } の真偽で質問を選ぶ。
  // 戻り値: { negative?, disaster?, gourmet?, model, at } または null（未設定/失敗）
  function classify(text, want) {
    if (!isReady() || !text) return Promise.resolve(null);
    const w = want || {};
    if (!w.negative && !w.disaster && !w.gourmet && !w.aiHype) return Promise.resolve(null);

    const key = signature(text, w);
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (inflight.has(key)) return inflight.get(key);

    const p = request(text, w)
      .then((r) => {
        cache.set(key, r);
        inflight.delete(key);
        return r;
      })
      .catch(() => {
        // 失敗はキャッシュしない（次回再試行できるように）
        inflight.delete(key);
        return null;
      });
    inflight.set(key, p);
    return p;
  }

  function clearCache() {
    cache.clear();
    inflight.clear();
  }

  const api = { configure, isReady, classify, clearCache };
  try {
    globalThis.X2TJev = api;
  } catch (e) {}
})();
