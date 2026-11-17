/**
 * スーパーアプリ (super.garoop.jp) は、ミニアプリを iframe で上に重ねて開く。
 * その中では SNS ログイン (Google / LINE / X など) や Stripe の画面が開けない
 * (どれも自分を iframe に入れさせない) ので、iframe の中にいるときだけ別タブで開く。
 *
 * - 別タブは opener 付きで開く。sessionStorage が新しいタブに写されるので、
 *   ログインの戻り先などの控えがそのまま使える
 * - ポップアップが止められたら、スーパーアプリごと画面を移す
 * - iframe の外 (ふつうに開いたとき) は今までどおりこの画面で移る
 */
export function navigateOutsideFrame(url: string): void {
  if (typeof window !== "undefined" && window.self !== window.top) {
    const tab = window.open(url, "_blank");
    if (tab) return;
    try {
      window.top!.location.href = url;
      return;
    } catch {
      // 移れなければ、この iframe の中で開く
    }
  }
  window.location.href = url;
}
