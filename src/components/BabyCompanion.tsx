"use client"

import { useState, useEffect, useCallback } from "react"
import { getPublicBabies, getMyBabies, type PublicBaby } from "@/lib/baby-api"
import { BabyChatDialog } from "./BabyChatDialog"
import BabyHatchPet, { hatchPetIdFromUrl } from "@/components/BabyHatchPet"

const ANIMAL_EMOJI: Record<string, string> = {
  cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊", bear: "🐻",
  panda: "🐼", wolf: "🐺", lion: "🦁", tiger: "🐯", penguin: "🐧",
  owl: "🦉", dragon: "🐲", unicorn: "🦄", bird: "🐦", hamster: "🐹",
}
function babyEmoji(animalType: string) {
  const lower = animalType.toLowerCase()
  for (const [k, v] of Object.entries(ANIMAL_EMOJI)) {
    if (lower.includes(k)) return v
  }
  return "🐣"
}

function BabyCard({ baby, isOwn = false, onChat }: { baby: PublicBaby; isOwn?: boolean; onChat: (baby: PublicBaby) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative flex flex-col items-center gap-1 group ${isOwn ? "scale-110" : ""}`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all group-hover:scale-110 overflow-hidden
          ${isOwn ? "border-amber-400 bg-amber-400/20 animate-pulse" : "border-amber-700/40 bg-slate-800/80"}`}>
          {hatchPetIdFromUrl(baby.avatarUrl) ? (
            <BabyHatchPet petId={hatchPetIdFromUrl(baby.avatarUrl)!} state="idle" size={46} />
          ) : (
            <>{babyEmoji(baby.animalType)}</>
          )}
        </div>
        {isOwn && (
          <span className="absolute -top-1 -right-1 text-[9px] bg-amber-400 text-slate-900 font-black px-1 rounded-full">YOU</span>
        )}
        <span className="text-[9px] text-amber-300/70 max-w-[56px] truncate">{baby.name}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 bg-slate-900 border border-amber-400/30 rounded-2xl p-3 shadow-2xl text-xs">
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white">✕</button>
          <div className="text-lg text-center mb-1">{babyEmoji(baby.animalType)}</div>
          <div className="text-amber-200 font-black text-center mb-1">{baby.name}</div>
          <div className="text-slate-400 text-[10px] text-center mb-2">{baby.animalType}</div>
          {baby.personality && (
            <p className="text-slate-300 text-[10px] leading-relaxed border-t border-slate-700 pt-2">{baby.personality}</p>
          )}
          <div className="mt-2 bg-slate-800 rounded-lg px-2 py-1 text-center">
            <span className="text-amber-400 font-black">Lv.{Math.floor(baby.growthLevel / 10) + 1}</span>
            <span className="text-slate-500 text-[9px] ml-1">成長度 {baby.growthLevel}%</span>
          </div>
          {isOwn && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onChat(baby) }}
              className="mt-2 w-full py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white text-[11px] font-black shadow active:scale-95 transition-transform"
            >
              💬 はなしかける
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function BabyCompanion() {
  const [myBabies, setMyBabies] = useState<PublicBaby[]>([])
  const [publicBabies, setPublicBabies] = useState<PublicBaby[]>([])
  const [loading, setLoading] = useState(true)
  const [chatBaby, setChatBaby] = useState<PublicBaby | null>(null)

  const load = useCallback(async () => {
    const isLogin = typeof window !== "undefined" && sessionStorage.getItem("isLogin") === "true"
    const [pub, mine] = await Promise.all([
      getPublicBabies(20),
      isLogin ? getMyBabies() : Promise.resolve([]),
    ])
    setPublicBabies(pub)
    setMyBabies(mine)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const handler = () => { load() }
    window.addEventListener("garu-login", handler)
    return () => window.removeEventListener("garu-login", handler)
  }, [load])

  const myBabyIds = new Set(myBabies.map(b => b.id))
  const others = publicBabies.filter(b => !myBabyIds.has(b.id))
  const allBabies = [...myBabies, ...others].slice(0, 20)

  return (
    <>
      {/* 右サイド赤ちゃんパネル (sticky) — 画面が狭いスマホでは邪魔なので非表示 */}
      <div className="hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 max-h-[80vh]">
        <div className="w-px h-3 bg-amber-400/20" />

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] scrollbar-none pb-2">
          {allBabies.map(b => (
            <BabyCard key={b.id} baby={b} isOwn={myBabyIds.has(b.id)} onChat={setChatBaby} />
          ))}
          {allBabies.length === 0 && !loading && (
            <div className="text-[9px] text-slate-600 text-center w-12">赤ちゃん{"\n"}まだいないよ</div>
          )}
        </div>
      </div>

      {chatBaby && (
        <BabyChatDialog baby={chatBaby} onClose={() => setChatBaby(null)} />
      )}
    </>
  )
}
