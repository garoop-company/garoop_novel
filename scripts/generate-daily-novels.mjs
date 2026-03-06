import { promises as fs } from 'node:fs';
import path from 'node:path';

const NOVELS_PATH = path.join(process.cwd(), 'src', 'data', 'novels.json');
const CHAPTERS_DIR = path.join(process.cwd(), 'src', 'data', 'chapters');
const SYSTEM_PROMPT_PATH = path.join(process.cwd(), 'prompts', 'garu-system-prompt.txt');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/chat';
const SUPPORTED_LANGS = ['ja', 'en', 'zh', 'fr', 'id', 'it', 'ne'];

const LOCALE_CONFIG = {
  ja: {
    languageName: '日本語',
    extraStyle: '語りは自然な日本語にする。',
    fallbackTitle: (series, episode) => `${series.category} 第${episode}話`,
    fallbackDescription: (series, episode) =>
      `${series.category}の第${episode}話。シングルマザーのカンガルー・ガルちゃんが新たな課題に向き合う。`,
  },
  en: {
    languageName: 'English',
    extraStyle: 'Write in natural English.',
    fallbackTitle: (series, episode) => `${series.key} Episode ${episode}`,
    fallbackDescription: (series, episode) =>
      `Episode ${episode} of ${series.key}. Garu-chan, a single mother kangaroo, faces a new challenge.`,
  },
  zh: {
    languageName: '中文',
    extraStyle: '使用自然流畅的简体中文。',
    fallbackTitle: (series, episode) => `${series.key} 第${episode}话`,
    fallbackDescription: (series, episode) =>
      `${series.key} 第${episode}话。单亲妈妈袋鼠Garu-chan迎接新的挑战。`,
  },
  fr: {
    languageName: 'Français',
    extraStyle: 'Rédige en français naturel.',
    fallbackTitle: (series, episode) => `${series.key} Épisode ${episode}`,
    fallbackDescription: (series, episode) =>
      `Épisode ${episode} de ${series.key}. Garu-chan, une mère célibataire kangourou, relève un nouveau défi.`,
  },
  id: {
    languageName: 'Bahasa Indonesia',
    extraStyle: 'Tulis dalam Bahasa Indonesia yang natural.',
    fallbackTitle: (series, episode) => `${series.key} Episode ${episode}`,
    fallbackDescription: (series, episode) =>
      `Episode ${episode} dari ${series.key}. Garu-chan, ibu tunggal kanguru, menghadapi tantangan baru.`,
  },
  it: {
    languageName: 'Italiano',
    extraStyle: 'Scrivi in italiano naturale.',
    fallbackTitle: (series, episode) => `${series.key} Episodio ${episode}`,
    fallbackDescription: (series, episode) =>
      `Episodio ${episode} di ${series.key}. Garu-chan, una madre single canguro, affronta una nuova sfida.`,
  },
  ne: {
    languageName: 'नेपाली',
    extraStyle: 'प्राकृतिक नेपाली भाषामा लेख।',
    fallbackTitle: (series, episode) => `${series.key} एपिसोड ${episode}`,
    fallbackDescription: (series, episode) =>
      `${series.key} को एपिसोड ${episode}। सिंगल मदर कंगारु गरु-चानले नयाँ चुनौती सामना गर्छिन्।`,
  },
};

const SERIES = [
  {
    key: 'garu-detective',
    category: 'ガルちゃん探偵',
    style: 'ミステリー。手がかり、推理、解決を明確に含める。',
    animationPreset: 'detective-noir',
  },
  {
    key: 'garu-intelligence',
    category: 'インテリジェンスガルちゃん',
    style: '情報戦サスペンス。分析、監視、意思決定の緊張感を重視する。',
    animationPreset: 'intel-grid',
  },
  {
    key: 'garu-entrepreneur',
    category: '10歳起業家カンガルーガルちゃん',
    style: '起業成長譚。売上、コスト、工夫など具体的な経営要素を入れる。',
    animationPreset: 'startup-pop',
  },
  {
    key: 'garu-genai',
    category: '生成AIとカンガルーガルちゃん',
    style: '生成AI活用譚。現実的なワークフロー改善と学習を描く。',
    animationPreset: 'neon-wave',
  },
  {
    key: 'garu-family',
    category: '子作りを布教するガルちゃん',
    style:
      '家族づくりの社会啓発譚。制度・支援・コミュニティ形成を中心に、教育的かつ健全に描く。',
    animationPreset: 'sunrise-community',
  },
];

function todayInJst() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function resolveTargetDate() {
  const fromEnv = (process.env.TARGET_DATE || '').trim();
  if (!fromEnv) return todayInJst();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromEnv)) {
    throw new Error(`TARGET_DATE の形式が不正です: ${fromEnv}`);
  }
  return fromEnv;
}

function resolveTargetLangs() {
  const fromEnv = (process.env.TARGET_LANGS || '').trim();
  if (!fromEnv) return SUPPORTED_LANGS;
  const langs = fromEnv
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(langs)];
  const unsupported = unique.filter((lang) => !SUPPORTED_LANGS.includes(lang));
  if (unsupported.length > 0) {
    throw new Error(`TARGET_LANGS に未対応の言語があります: ${unsupported.join(', ')}`);
  }
  if (unique.length === 0) {
    throw new Error('TARGET_LANGS が空です。');
  }
  return unique;
}

function extractJsonBlock(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1);
  }
  throw new Error('モデル出力からJSONを抽出できませんでした。');
}

function chapterPath(chapterFile) {
  return path.join(CHAPTERS_DIR, chapterFile);
}

async function readPagesFromChapterFile(chapterFile) {
  const raw = await fs.readFile(chapterPath(chapterFile), 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.pages)) {
    throw new Error(`chapterFile の pages が不正です: ${chapterFile}`);
  }
  return parsed.pages.map((p) => normalizeText(p)).filter(Boolean);
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateEpisode(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('JSONがオブジェクトではありません。');
  }
  const rawTitle = normalizeText(data.title);
  const rawDescription = normalizeText(data.description);
  const title = rawTitle.length >= 4 ? rawTitle : '';
  const description = rawDescription.length >= 20 ? rawDescription : '';

  const pages = Array.isArray(data.pages)
    ? data.pages
    : Array.isArray(data.content)
      ? data.content
      : null;

  if (!pages || pages.length < 5 || pages.length > 7) {
    throw new Error('pages(content) は5〜7の文字列配列にしてください。');
  }
  const normalizedPages = pages.map((p) => normalizeText(p)).filter(Boolean);
  if (normalizedPages.length < 5) {
    throw new Error('pages(content) の本文が不足しています。');
  }

  if (!Array.isArray(data.keywords) || data.keywords.length < 3) {
    throw new Error('keywords は3件以上必要です。');
  }
  const normalizedKeywords = data.keywords.map((k) => normalizeText(k)).filter(Boolean);
  if (normalizedKeywords.length < 3) {
    throw new Error('keywords の有効件数が不足しています。');
  }

  return {
    title,
    description,
    pages: normalizedPages,
    keywords: normalizedKeywords,
  };
}

async function generateEpisode({ apiKey, model, systemPrompt, series, nextEpisode, recentEpisodes, lang }) {
  const locale = LOCALE_CONFIG[lang] || LOCALE_CONFIG.ja;
  const previousSummary = recentEpisodes.length
    ? recentEpisodes
        .map((ep) => `- 第${ep.episodeNumber}話: ${ep.title} / ${ep.description}`)
        .join('\n')
    : '- なし（今回が第1話）';

  const userPrompt = [
    `シリーズ名: ${series.category}`,
    `生成対象: 第${nextEpisode}話`,
    `出力言語: ${locale.languageName} (${lang})`,
    `シリーズ文体要件: ${series.style}`,
    `言語スタイル要件: ${locale.extraStyle}`,
    '過去話サマリ:',
    previousSummary,
    '',
    '要件:',
    '- 主人公は必ずシングルマザーのカンガルー「ガルちゃん」。',
    '- 読み切りとして成立しつつ、次話へのフックを残す。',
    `- title/description/pages/keywords は必ず ${locale.languageName} で書く。`,
    '- pages は 5〜7 ページの文字列配列にする。',
    '- keywords は 5〜8 個の文字列配列にする。',
    '- 露骨な性的描写は禁止。',
    '',
    '次のJSONのみ返すこと:',
    '{',
    '  "title": "...",',
    '  "description": "...",',
    '  "pages": ["...", "...", "...", "...", "..."],',
    '  "keywords": ["...", "...", "...", "...", "..."]',
    '}',
  ].join('\n');

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const content = await requestModel({
        apiKey,
        model,
        temperature: 0.9,
        systemPrompt,
        userPrompt: `${userPrompt}\n\n注意: title/description/pages/keywords を必ず埋めてください。`,
      });
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('モデルレスポンスに本文がありませんでした。');
      }

      const parsed = JSON.parse(extractJsonBlock(content));
      const validated = validateEpisode(parsed);

      if (!validated.title) {
        validated.title = locale.fallbackTitle(series, nextEpisode);
      }
      if (!validated.description) {
        validated.description = locale.fallbackDescription(series, nextEpisode);
      }
      return validated;
    } catch (err) {
      lastError = err;
      console.warn(`[warn] ${series.category} 第${nextEpisode}話 生成失敗 (attempt ${attempt}/3): ${String(err)}`);
    }
  }

  throw lastError ?? new Error('不明な生成エラー');
}

async function translateEpisodeFromJapanese({
  apiKey,
  model,
  systemPrompt,
  series,
  sourceEpisode,
  sourcePages,
  targetLang,
}) {
  const locale = LOCALE_CONFIG[targetLang] || LOCALE_CONFIG.ja;
  const sourcePayload = {
    title: sourceEpisode.title,
    description: sourceEpisode.description,
    pages: sourcePages,
    keywords: String(sourceEpisode.keywords || '')
      .split(',')
      .map((k) => normalizeText(k))
      .filter(Boolean),
  };

  const userPrompt = [
    `タスク: 日本語小説を ${locale.languageName} (${targetLang}) に翻訳する`,
    `シリーズ: ${series.category}`,
    `話数: 第${sourceEpisode.episodeNumber}話`,
    `翻訳スタイル要件: ${locale.extraStyle}`,
    '',
    '要件:',
    '- 物語の意味・出来事の順序・人物名を維持する。',
    '- 原文にない設定を追加しない。',
    '- pages の件数を原文と同じにする。',
    '- keywords は 5〜8 個を目安に自然な語へ翻訳する。',
    '- 露骨な性的描写は禁止。',
    '',
    '原文(JSON):',
    JSON.stringify(sourcePayload, null, 2),
    '',
    '次のJSONのみ返すこと:',
    '{',
    '  "title": "...",',
    '  "description": "...",',
    '  "pages": ["...", "...", "...", "...", "..."],',
    '  "keywords": ["...", "...", "...", "...", "..."]',
    '}',
  ].join('\n');

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const content = await requestModel({
        apiKey,
        model,
        temperature: 0.3,
        systemPrompt,
        userPrompt,
      });
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('モデルレスポンスに本文がありませんでした。');
      }

      const parsed = JSON.parse(extractJsonBlock(content));
      const validated = validateEpisode(parsed);
      if (validated.pages.length !== sourcePages.length) {
        throw new Error(`翻訳結果の pages 件数が不一致です: ${validated.pages.length} != ${sourcePages.length}`);
      }
      if (!validated.title) {
        validated.title = locale.fallbackTitle(series, sourceEpisode.episodeNumber);
      }
      if (!validated.description) {
        validated.description = locale.fallbackDescription(series, sourceEpisode.episodeNumber);
      }
      return validated;
    } catch (err) {
      lastError = err;
      console.warn(
        `[warn] ${series.category} 第${sourceEpisode.episodeNumber}話 翻訳失敗 (${targetLang}, attempt ${attempt}/3): ${String(err)}`
      );
    }
  }

  throw lastError ?? new Error('不明な翻訳エラー');
}

async function main() {
  const provider = resolveProvider();
  const apiKey = process.env.GROQ_API_KEY;
  const model = resolveModel(provider);
  const force = process.env.FORCE_GENERATION === 'true';
  const syncFromJa = process.env.SYNC_FROM_JA !== 'false';
  const targetDate = resolveTargetDate();
  const targetLangs = resolveTargetLangs();

  if (provider === 'groq' && !apiKey) {
    throw new Error('GROQ_API_KEY が未設定です。');
  }

  const [systemPrompt, novelsRaw] = await Promise.all([
    fs.readFile(SYSTEM_PROMPT_PATH, 'utf8'),
    fs.readFile(NOVELS_PATH, 'utf8'),
  ]);

  const novels = JSON.parse(novelsRaw);
  if (!Array.isArray(novels)) {
    throw new Error('novels.json は配列である必要があります。');
  }

  const created = [];
  const failed = [];

  for (const series of SERIES) {
    const jaSeries = novels
      .filter((n) => n.seriesKey === series.key && n.lang === 'ja')
      .sort((a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0));

    let latestJa = jaSeries.at(-1);
    if (!force && latestJa?.createdAt === targetDate) {
      console.log(`[skip] ${series.category} [ja]: 指定日分は生成済み (${latestJa.title})`);
    } else if (targetLangs.includes('ja')) {
      const nextEpisode = Number(latestJa?.episodeNumber || 0) + 1;
      let generated;
      try {
        generated = await generateEpisode({
          apiKey,
          model,
          systemPrompt,
          series,
          nextEpisode,
          recentEpisodes: jaSeries.slice(-3),
          lang: 'ja',
        });
      } catch (err) {
        failed.push({ series: `${series.category}[ja]`, episode: nextEpisode, error: String(err) });
        console.error(`[error] ${series.category} [ja]: 第${nextEpisode}話の生成に失敗: ${String(err)}`);
        continue;
      }

      const id = `${series.key}-${String(nextEpisode).padStart(3, '0')}`;
      const chapterFile = `${id}.ja.json`;

      await fs.writeFile(
        chapterPath(chapterFile),
        `${JSON.stringify({ id, lang: 'ja', pages: generated.pages }, null, 2)}\n`,
        'utf8'
      );

      const item = {
        id,
        seriesKey: series.key,
        episodeNumber: nextEpisode,
        title: generated.title,
        description: generated.description,
        category: series.category,
        chapterFile,
        pageCount: generated.pages.length,
        animationPreset: series.animationPreset,
        keywords: generated.keywords.join(', '),
        lang: 'ja',
        createdAt: targetDate,
      };
      novels.push(item);
      jaSeries.push(item);
      created.push(item);
      latestJa = item;
      console.log(`[ok] ${series.category} [ja]: 第${nextEpisode}話を追加 (${id})`);
    }

    for (const lang of targetLangs.filter((l) => l !== 'ja')) {
      const inSeries = novels
        .filter((n) => n.seriesKey === series.key && n.lang === lang)
        .sort((a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0));

      if (syncFromJa) {
        const latestJaEpisodeNumber = Number(jaSeries.at(-1)?.episodeNumber || 0);
        let nextEpisode = Number(inSeries.at(-1)?.episodeNumber || 0) + 1;
        while (nextEpisode <= latestJaEpisodeNumber) {
          const sourceEpisode = jaSeries.find((ep) => Number(ep.episodeNumber) === nextEpisode);
          if (!sourceEpisode?.chapterFile) break;

          let sourcePages;
          try {
            sourcePages = await readPagesFromChapterFile(sourceEpisode.chapterFile);
          } catch (err) {
            failed.push({ series: `${series.category}[${lang}]`, episode: nextEpisode, error: String(err) });
            console.error(
              `[error] ${series.category} [${lang}]: 第${nextEpisode}話の原文読込に失敗: ${String(err)}`
            );
            break;
          }

          let translated;
          try {
            translated = await translateEpisodeFromJapanese({
              apiKey,
              model,
              systemPrompt,
              series,
              sourceEpisode,
              sourcePages,
              targetLang: lang,
            });
          } catch (err) {
            failed.push({ series: `${series.category}[${lang}]`, episode: nextEpisode, error: String(err) });
            console.error(`[error] ${series.category} [${lang}]: 第${nextEpisode}話の翻訳に失敗: ${String(err)}`);
            break;
          }

          const id = `${series.key}-${String(nextEpisode).padStart(3, '0')}`;
          const chapterFile = `${id}.${lang}.json`;
          await fs.writeFile(
            chapterPath(chapterFile),
            `${JSON.stringify({ id, lang, pages: translated.pages }, null, 2)}\n`,
            'utf8'
          );

          const item = {
            id,
            seriesKey: series.key,
            episodeNumber: nextEpisode,
            title: translated.title,
            description: translated.description,
            category: series.category,
            chapterFile,
            pageCount: translated.pages.length,
            animationPreset: series.animationPreset,
            keywords: translated.keywords.join(', '),
            lang,
            createdAt: sourceEpisode.createdAt || targetDate,
          };
          novels.push(item);
          inSeries.push(item);
          created.push(item);
          console.log(`[ok] ${series.category} [${lang}]: 第${nextEpisode}話を翻訳追加 (${id})`);
          nextEpisode += 1;
        }
        continue;
      }

      const latest = inSeries.at(-1);
      if (!force && latest?.createdAt === targetDate) {
        console.log(`[skip] ${series.category} [${lang}]: 指定日分は生成済み (${latest.title})`);
        continue;
      }

      const nextEpisode = Number(latest?.episodeNumber || 0) + 1;
      let generated;
      try {
        generated = await generateEpisode({
          apiKey,
          model,
          systemPrompt,
          series,
          nextEpisode,
          recentEpisodes: inSeries.slice(-3),
          lang,
        });
      } catch (err) {
        failed.push({ series: `${series.category}[${lang}]`, episode: nextEpisode, error: String(err) });
        console.error(`[error] ${series.category} [${lang}]: 第${nextEpisode}話の生成に失敗: ${String(err)}`);
        continue;
      }

      const id = `${series.key}-${String(nextEpisode).padStart(3, '0')}`;
      const chapterFile = `${id}.${lang}.json`;
      await fs.writeFile(
        chapterPath(chapterFile),
        `${JSON.stringify({ id, lang, pages: generated.pages }, null, 2)}\n`,
        'utf8'
      );

      const item = {
        id,
        seriesKey: series.key,
        episodeNumber: nextEpisode,
        title: generated.title,
        description: generated.description,
        category: series.category,
        chapterFile,
        pageCount: generated.pages.length,
        animationPreset: series.animationPreset,
        keywords: generated.keywords.join(', '),
        lang,
        createdAt: targetDate,
      };
      novels.push(item);
      created.push(item);
      console.log(`[ok] ${series.category} [${lang}]: 第${nextEpisode}話を追加 (${id})`);
    }
  }

  if (!created.length) {
    if (failed.length > 0) {
      throw new Error(`全シリーズ生成失敗: ${failed.map((f) => `${f.series}#${f.episode}`).join(', ')}`);
    }
    console.log('新規生成なし。更新はありませんでした。');
    return;
  }

  await fs.writeFile(NOVELS_PATH, `${JSON.stringify(novels, null, 2)}\n`, 'utf8');
  console.log(`完了: ${created.length}件のエピソードを追加しました。`);
  if (failed.length > 0) {
    console.warn(
      `一部失敗: ${failed.map((f) => `${f.series} 第${f.episode}話`).join(', ')}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

function resolveProvider() {
  const raw = (process.env.LLM_PROVIDER || '').trim().toLowerCase();
  if (!raw) {
    return process.env.OLLAMA_MODEL ? 'ollama' : 'groq';
  }
  if (raw !== 'groq' && raw !== 'ollama') {
    throw new Error(`LLM_PROVIDER が不正です: ${raw}`);
  }
  return raw;
}

function resolveModel(provider) {
  if (provider === 'ollama') {
    return process.env.OLLAMA_MODEL || 'qwen3.5:4b';
  }
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

async function requestModel({ apiKey, model, temperature, systemPrompt, userPrompt }) {
  const provider = resolveProvider();
  if (provider === 'ollama') {
    return requestOllama({ model, temperature, systemPrompt, userPrompt });
  }
  return requestGroq({ apiKey, model, temperature, systemPrompt, userPrompt });
}

async function requestGroq({ apiKey, model, temperature, systemPrompt, userPrompt }) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq APIエラー (${response.status}): ${err}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content;
}

async function requestOllama({ model, temperature, systemPrompt, userPrompt }) {
  const response = await fetch(process.env.OLLAMA_BASE_URL || OLLAMA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      options: {
        temperature,
      },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama APIエラー (${response.status}): ${err}`);
  }

  const payload = await response.json();
  return payload?.message?.content;
}
