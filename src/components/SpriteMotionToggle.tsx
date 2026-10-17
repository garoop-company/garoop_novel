"use client"

import { usePathname } from "next/navigation"
import { getDictionary } from "@/locales"
import { detectLocaleFromPathname } from "@/lib/locale-path"
import { setSpriteMotion, useSpriteMotionEnabled } from "@/lib/sprite-motion"

/** キャラクターのスプライト・アニメーションの「うごかす / とめる」切り替え */
export function SpriteMotionToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const pathname = usePathname()
  const dict = getDictionary(detectLocaleFromPathname(pathname ?? "/"))
  const on = useSpriteMotionEnabled()
  const t = dict.motion

  // 子ども向けなので見た目はアイコンだけ。文言は aria-label / title（読み上げ・ホバー）にのみ使う
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t.label}
      title={on ? t.off : t.on}
      onClick={() => setSpriteMotion(!on)}
      className={`inline-grid place-items-center rounded-full border leading-none transition-colors flex-shrink-0 ${
        compact ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
      } ${
        on
          ? "bg-amber-400/20 border-amber-300/50 text-amber-200"
          : "bg-slate-900/60 border-slate-600/60 text-slate-300 hover:bg-slate-800/80"
      } ${className}`}
    >
      <span aria-hidden>{on ? "⏸" : "▶"}</span>
    </button>
  )
}

export default SpriteMotionToggle
