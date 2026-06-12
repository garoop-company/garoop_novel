"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// プラン変更ページ（マイベイビー側）
const PLAN_CHANGE_URL = "https://baby.garoop.jp/plan";

type PlanKey = "free" | "super" | "pro" | "vip";

const PLANS: {
  key: PlanKey;
  emoji: string;
  label: string;
  tagline: string;
  desc: string;
  ring: string;
}[] = [
  {
    key: "free",
    emoji: "🌱",
    label: "フリー",
    tagline: "まずはここから",
    desc: "マイベイビーを育てて、AI小説・ドラマ・ハッチペットを楽しめる基本プラン。",
    ring: "border-white/15 bg-white/5",
  },
  {
    key: "super",
    emoji: "⭐",
    label: "スーパー",
    tagline: "もっと育てたい人へ",
    desc: "育成できるマイベイビーの枠がひろがり、広告ひかえめ＆機能が拡張されます。",
    ring: "border-amber-400/40 bg-amber-500/10",
  },
  {
    key: "pro",
    emoji: "🚀",
    label: "プロ",
    tagline: "本格的に楽しむ人へ",
    desc: "育成枠と限定機能をさらに開放。AI機能やコンテンツをたっぷり使えます。",
    ring: "border-cyan-400/40 bg-cyan-500/10",
  },
  {
    key: "vip",
    emoji: "👑",
    label: "ヴィップ",
    tagline: "すべてを最大限に",
    desc: "全機能を最大限に開放。最優先サポートと限定コンテンツが利用できます。",
    ring: "border-fuchsia-400/40 bg-fuchsia-500/10",
  },
];

export function currentPlanKey(planType?: string | null): PlanKey {
  const t = (planType ?? "").toLowerCase();
  if (t.includes("vip")) return "vip";
  if (t.includes("pro")) return "pro";
  if (t.includes("super")) return "super";
  return "free";
}

export function PlanInfoModal({
  planType,
  onClose,
}: {
  planType?: string | null;
  onClose: () => void;
}) {
  const active = currentPlanKey(planType);

  // Escape で閉じる & スクロールロック
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="プランの説明"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative z-10 w-full sm:max-w-md max-h-[90svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-amber-200/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 shadow-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* ヘッダー */}
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-amber-200/15 bg-slate-900/80 backdrop-blur">
            <div>
              <p className="font-serif text-amber-50 text-lg leading-none">プランについて</p>
              <p className="mt-1 text-amber-200/60 text-[11px] tracking-widest">
                ご利用中のプランと内容
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="閉じる"
              className="w-9 h-9 rounded-full text-amber-200 hover:bg-amber-400/10 flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>

          {/* プラン一覧 */}
          <div className="px-5 py-4 flex flex-col gap-2.5">
            {PLANS.map((p) => {
              const isActive = p.key === active;
              return (
                <div
                  key={p.key}
                  className={`relative rounded-2xl border p-3.5 transition ${p.ring} ${
                    isActive ? "ring-2 ring-amber-300/70" : "opacity-90"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-amber-50 text-sm flex items-center gap-2">
                        {p.label}
                        {isActive && (
                          <span className="text-[10px] font-black text-slate-900 bg-amber-300 px-2 py-0.5 rounded-full">
                            ご利用中
                          </span>
                        )}
                      </p>
                      <p className="text-amber-200/60 text-[11px]">{p.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-amber-50/75 text-[12px] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* フッター：変更導線 */}
          <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
            <a
              href={PLAN_CHANGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 text-white font-black shadow active:scale-[0.99] transition-transform"
            >
              プランを変更する
              <span aria-hidden>↗</span>
            </a>
            <p className="text-amber-200/45 text-[10px] text-center leading-relaxed">
              ※ プランの詳細・お申し込み・変更は、マイベイビーのプランページで行えます。
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PlanInfoModal;
