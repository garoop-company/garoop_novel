// 連携先の各種ページから baby.garoop.jp へ誘導する CTA。
// 「戻る」ではなく「育てる・調教・産む」を想起させたいので、
// 動詞並びと 👶 絵文字、ピンクグラデーションで遊びにいくテンションにする。
export function BackToBabyButton() {
  return (
    <a
      href="https://baby.garoop.jp/"
      aria-label="赤ちゃんを育てに行く"
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 hover:from-pink-500 hover:to-fuchsia-500 hover:scale-105 active:scale-95 rounded-full px-3.5 py-2 text-[11px] font-black text-white shadow-lg shadow-pink-400/30 transition-all"
    >
      <span className="text-sm leading-none" aria-hidden="true">👶</span>
      育てる・調教・産む
    </a>
  )
}
