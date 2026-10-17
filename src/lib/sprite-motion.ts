"use client"

// スプライト・アニメーションの再生制御（全キャラが同時に動いて重くならないように）
//   - 「うごかす」設定（localStorage）: OFF ならタップしたキャラだけ短く動く
//   - 既定値は OS の prefers-reduced-motion に従う（減らす設定なら OFF）
//   - タブが非表示（visibilitychange）／画面外（IntersectionObserver）なら止める
//   - タップ再生は同時に 1 体だけ
// <html data-sprite-motion="on|off"> も付けるので CSS アニメーションの停止にも使える。

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react"

const PREF_KEY = "garu-sprite-motion"
const TAP_PLAY_MS = 3200

type Pref = "on" | "off" | null

let pref: Pref = null
let reduced = false
let hidden = false
let tapOwner: string | null = null
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function motionOn(): boolean {
  init()
  return pref ? pref === "on" : !reduced
}

function applyAttr() {
  if (typeof document === "undefined") return
  document.documentElement.dataset.spriteMotion = motionOn() ? "on" : "off"
}

function init() {
  if (initialized || typeof window === "undefined") return
  initialized = true
  try {
    const v = window.localStorage.getItem(PREF_KEY)
    pref = v === "on" || v === "off" ? v : null
  } catch { /* storage blocked */ }
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
  reduced = !!mq?.matches
  mq?.addEventListener?.("change", (e) => { reduced = e.matches; applyAttr(); emit() })
  hidden = document.visibilityState === "hidden"
  document.addEventListener("visibilitychange", () => {
    hidden = document.visibilityState === "hidden"
    emit()
  })
  window.addEventListener("storage", (e) => {
    if (e.key !== PREF_KEY) return
    pref = e.newValue === "on" || e.newValue === "off" ? e.newValue : null
    applyAttr()
    emit()
  })
  // <html data-sprite-motion> は subscribe（＝ハイドレーション完了後）で付ける。
  // ここ（レンダー中の getSnapshot から呼ばれうる）で付けると属性の hydration 差分になる。
}

function subscribe(l: () => void) {
  init()
  applyAttr()
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** 「うごかす」設定を変更する */
export function setSpriteMotion(on: boolean) {
  init()
  pref = on ? "on" : "off"
  try { window.localStorage.setItem(PREF_KEY, pref) } catch { /* ignore */ }
  applyAttr()
  emit()
}

/** 「うごかす」が ON か（SSR/ハイドレーション中は false = 静止） */
export function useSpriteMotionEnabled(): boolean {
  return useSyncExternalStore(subscribe, motionOn, () => false)
}

/** タブが表示中か */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribe, () => { init(); return !hidden }, () => true)
}

function useTapOwner(): string | null {
  return useSyncExternalStore(subscribe, () => tapOwner, () => null)
}

/** 要素が画面内にあるか。display:none の要素も false になる */
export function useInView(el: Element | null, rootMargin = "64px"): boolean {
  // IntersectionObserver が無い古い環境では常に「画面内」扱い
  const [inView, setInView] = useState(() => typeof window !== "undefined" && typeof IntersectionObserver === "undefined")
  useEffect(() => {
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) setInView(e.isIntersecting) },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el, rootMargin])
  return inView
}

type SpriteOptions = {
  frames: number
  fps: number
  /** auto: 「うごかす」ON なら常時再生 / tap: タップ・ホバーした時だけ短く再生 */
  mode?: "auto" | "tap"
  paused?: boolean
  /** 変わったらフレーム 0 から再生し直す（ポーズ・状態名など） */
  resetKey?: string
  /** frame 番号 → background-position */
  position: (frame: number) => string
}

/**
 * スプライトのフレーム送り。React の state は使わず DOM の style を直接書き換えるので、
 * 再生中もコンポーネントは再レンダーされない。
 * 返り値の ref をスプライト要素に付け、activate() を onClick 等に渡すと、そのキャラだけ数秒間動く（同時に 1 体）。
 */
export function useSpriteAnimation({ frames, fps, mode = "auto", paused = false, resetKey = "", position }: SpriteOptions) {
  const id = useId()
  // 要素は callback ref で受け取る（state は IntersectionObserver 用、ref は style 書き換え用）
  const nodeRef = useRef<HTMLElement | null>(null)
  const [el, setEl] = useState<HTMLElement | null>(null)
  const ref = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node
    setEl(node)
  }, [])
  const enabled = useSpriteMotionEnabled()
  const visible = usePageVisible()
  const inView = useInView(el)
  const owner = useTapOwner()
  const isTapActive = owner === id
  const playing = !paused && frames > 1 && visible && inView && (isTapActive || (mode === "auto" && enabled))

  const posRef = useRef(position)
  useEffect(() => { posRef.current = position })

  useEffect(() => {
    const node = nodeRef.current
    if (!node || !el) return
    let f = 0
    node.style.backgroundPosition = posRef.current(0)
    if (!playing) return
    const t = window.setInterval(() => {
      f = (f + 1) % frames
      node.style.backgroundPosition = posRef.current(f)
    }, 1000 / Math.max(1, fps))
    return () => window.clearInterval(t)
  }, [el, playing, frames, fps, resetKey])

  const timerRef = useRef<number | null>(null)
  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (tapOwner === id) { tapOwner = null; emit() }
  }, [id])

  const activate = useCallback(() => {
    init()
    tapOwner = id
    emit()
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if (tapOwner === id) { tapOwner = null; emit() }
    }, TAP_PLAY_MS)
  }, [id])

  /** スプライトを描く要素に ref として渡す */
  return { ref, playing, activate }
}
