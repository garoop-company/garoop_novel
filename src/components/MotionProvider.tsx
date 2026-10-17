"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

// OS の「視差効果を減らす」(prefers-reduced-motion) が ON なら framer-motion の
// transform 系アニメーション（無限ループの上下ゆれ等）を止める。
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export default MotionProvider
