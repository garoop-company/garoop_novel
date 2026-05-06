import { NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
]

const RESPONSE_LANGUAGE: Record<string, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  fr: "Français",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ne: "नेपाली",
}

const PAGE_TEXT_LIMIT = 3500
const HISTORY_LIMIT = 10

type ChatHistoryItem = { role: "user" | "assistant"; content: string }

type ChatRequest = {
  baby?: {
    name?: string
    animalType?: string
    personality?: string | null
    description?: string | null
    growthLevel?: number | null
  }
  message?: string
  pageContext?: {
    title?: string
    url?: string
    text?: string
    serviceName?: string
  }
  locale?: string
  history?: ChatHistoryItem[]
}

function getChatModels() {
  const configured = process.env.GROQ_CHAT_MODELS
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean)
  return configured?.length ? configured : DEFAULT_GROQ_MODELS
}

function clampText(text: string | undefined, limit: number): string {
  if (!text) return ""
  const trimmed = text.replace(/\s+/g, " ").trim()
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}…` : trimmed
}

function buildSystemPrompt(req: ChatRequest): string {
  const baby = req.baby ?? {}
  const ctx = req.pageContext ?? {}
  const language = RESPONSE_LANGUAGE[req.locale ?? "ja"] ?? "日本語"
  const name = baby.name?.trim() || "ガルちゃん"
  const animalType = baby.animalType?.trim() || ""
  const personality = baby.personality?.trim() || ""
  const description = baby.description?.trim() || ""
  const growth = typeof baby.growthLevel === "number" ? `成長度 ${baby.growthLevel}%` : ""

  const profileLines = [
    `あなたは「${name}」という名前の赤ちゃんです。`,
    animalType ? `タイプ: ${animalType}` : "",
    personality ? `性格: ${personality}` : "",
    description ? `生い立ち: ${description}` : "",
    growth,
  ].filter(Boolean)

  const pageLines = [
    ctx.serviceName ? `今いるサービス: ${ctx.serviceName}` : "",
    ctx.title ? `ページタイトル: ${ctx.title}` : "",
    ctx.url ? `URL: ${ctx.url}` : "",
    ctx.text ? `ページ内容（抜粋）:\n${clampText(ctx.text, PAGE_TEXT_LIMIT)}` : "",
  ].filter(Boolean)

  return [
    profileLines.join("\n"),
    "",
    "話しかけてくる相手は、あなたを連れて遊びに来てくれた人です。子どもにもわかるように、やさしく・かわいく・短めの言葉で答えてください。むずかしい言葉は使わず、ひらがな多めで、絵文字や擬音語を時々添えても大丈夫です。",
    "今のページの内容を踏まえて答えてください。ページのコンポーネントや文章をもとに、ゲームのやり方・物語の続き・操作方法など、相手が知りたいことを教えてあげてください。情報がページ内に無い場合は、「むずかしいなぁ」と素直に伝えてOK。",
    "返事は2〜4文程度の短さに収めてください。",
    `必ず ${language} で返答してください。`,
    "",
    pageLines.length ? `--- 今いるページの情報 ---\n${pageLines.join("\n")}` : "（ページ情報なし）",
  ].join("\n")
}

function buildMessages(req: ChatRequest) {
  const system = { role: "system" as const, content: buildSystemPrompt(req) }
  const history = (req.history ?? [])
    .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
    .slice(-HISTORY_LIMIT)
    .map((h) => ({ role: h.role, content: h.content }))
  const user = { role: "user" as const, content: req.message?.trim() ?? "" }
  return [system, ...history, user]
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest

    if (!body?.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 500 })
    }

    const messages = buildMessages(body)
    const attempts: Array<{ model: string; status: number; detail: string }> = []

    for (const model of getChatModels()) {
      const groqRes = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, temperature: 0.8 }),
      })

      if (!groqRes.ok) {
        attempts.push({ model, status: groqRes.status, detail: await groqRes.text() })
        continue
      }

      const data = await groqRes.json()
      const text = data?.choices?.[0]?.message?.content
      if (!text) {
        attempts.push({ model, status: 502, detail: "No response" })
        continue
      }

      return NextResponse.json({ text, model })
    }

    return NextResponse.json(
      { error: "Groq request failed for all configured models", attempts },
      { status: attempts[0]?.status ?? 502 },
    )
  } catch (error) {
    console.error("chat-with-baby route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
