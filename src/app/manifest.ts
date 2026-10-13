import type { MetadataRoute } from "next";

/**
 * ホーム画面に追加したとき・TWA（Google Play 版）で開いたときの見た目。
 * /manifest.webmanifest として配られる。
 *
 * 色はサイトの暗い背景（globals.css の #07080c）とヘッダー（#0a0807）に合わせる。
 * 白にすると、起動時のスプラッシュから本体に切り替わる瞬間に白く光って見える。
 *
 * 日本語は接頭辞なし（/）で配っているので start_url と scope も "/"。
 * /en/ などの他言語ページも scope "/" に含まれるので、アプリ内で開ける。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Garoop Novel",
    short_name: "Garoop Novel",
    description:
      "Garoop Novelは、生成AIと赤ちゃんが大暴れする新感覚エンタメテーマパーク。AI、アニメ、小説など、ワクワクするコンテンツを発信中。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07080c",
    theme_color: "#0a0807",
    lang: "ja",
    categories: ["entertainment", "books"],
    icons: [
      {
        src: "/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      // webp を読めない取り込み先のための控え。
      // TWA を作る Bubblewrap は webp を渡すと
      // "Unsupported MIME type: image/webp" で止まる。
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // maskable は端末側で丸などに切り抜かれる。
      // 元の絵は端まで描き込まれていて、そのままだと耳が欠けるので、
      // 80% に縮めて周りをヘッダーと同じ暗い色で塗った別の絵を使う。
      {
        src: "/icon-maskable-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
