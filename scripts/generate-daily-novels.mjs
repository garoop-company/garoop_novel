import { promises as fs } from 'node:fs';
import path from 'node:path';

const NOVELS_PATH = path.join(process.cwd(), 'src', 'data', 'novels.json');
const CHAPTERS_DIR = path.join(process.cwd(), 'src', 'data', 'chapters');
const SYSTEM_PROMPT_PATH = path.join(process.cwd(), 'prompts', 'garu-system-prompt.txt');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

function validateEpisode(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('JSONがオブジェクトではありません。');
  }
  if (typeof data.title !== 'string' || data.title.length < 8) {
    throw new Error('title が不正です。');
  }
  if (typeof data.description !== 'string' || data.description.length < 20) {
    throw new Error('description が不正です。');
  }

  const pages = Array.isArray(data.pages)
    ? data.pages
    : Array.isArray(data.content)
      ? data.content
      : null;

  if (!pages || pages.length < 5 || pages.length > 7 || !pages.every((p) => typeof p === 'string' && p.trim())) {
    throw new Error('pages(content) は5〜7の文字列配列にしてください。');
  }

  if (!Array.isArray(data.keywords) || data.keywords.length < 3) {
    throw new Error('keywords は3件以上必要です。');
  }

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    pages,
    keywords: data.keywords.map((k) => String(k).trim()).filter(Boolean),
  };
}

async function generateEpisode({ apiKey, model, systemPrompt, series, nextEpisode, recentEpisodes }) {
  const previousSummary = recentEpisodes.length
    ? recentEpisodes
        .map((ep) => `- 第${ep.episodeNumber}話: ${ep.title} / ${ep.description}`)
        .join('\n')
    : '- なし（今回が第1話）';

  const userPrompt = [
    `シリーズ名: ${series.category}`,
    `生成対象: 第${nextEpisode}話`,
    `シリーズ文体要件: ${series.style}`,
    '過去話サマリ:',
    previousSummary,
    '',
    '要件:',
    '- 主人公は必ずシングルマザーのカンガルー「ガルちゃん」。',
    '- 読み切りとして成立しつつ、次話へのフックを残す。',
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

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
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
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Groqレスポンスに本文がありませんでした。');
  }

  const parsed = JSON.parse(extractJsonBlock(content));
  return validateEpisode(parsed);
}

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const force = process.env.FORCE_GENERATION === 'true';
  const targetDate = resolveTargetDate();

  if (!apiKey) {
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

  for (const series of SERIES) {
    const inSeries = novels
      .filter((n) => n.seriesKey === series.key)
      .sort((a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0));

    const latest = inSeries.at(-1);
    if (!force && latest?.createdAt === targetDate) {
      console.log(`[skip] ${series.category}: 指定日分は生成済み (${latest.title})`);
      continue;
    }

    const nextEpisode = Number(latest?.episodeNumber || 0) + 1;
    const generated = await generateEpisode({
      apiKey,
      model,
      systemPrompt,
      series,
      nextEpisode,
      recentEpisodes: inSeries.slice(-3),
    });

    const id = `${series.key}-${String(nextEpisode).padStart(3, '0')}`;
    const chapterFile = `${id}.json`;

    await fs.writeFile(
      path.join(CHAPTERS_DIR, chapterFile),
      `${JSON.stringify({ id, pages: generated.pages }, null, 2)}\n`,
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
    created.push(item);
    console.log(`[ok] ${series.category}: 第${nextEpisode}話を追加 (${id})`);
  }

  if (!created.length) {
    console.log('新規生成なし。更新はありませんでした。');
    return;
  }

  await fs.writeFile(NOVELS_PATH, `${JSON.stringify(novels, null, 2)}\n`, 'utf8');
  console.log(`完了: ${created.length}件のエピソードを追加しました。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
