"use client";

import { useEffect } from "react";

/**
 * Service Worker（public/sw.js）の登録。
 *
 * 目的は圏外のときに真っ白な画面を出さないこと。
 * Google Play（TWA）で配るため、通信が無いときに何も出ないと
 * 壊れているアプリと見なされる。
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // 開発中は登録しない。古い版が残って、変更が反映されないのを避ける。
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        // 登録できなくてもサイトは動く。黙って落とさず、気づけるようにはする。
        console.warn("[garoop-novel] Service Worker を登録できませんでした", error);
      });
    };

    // 最初の描画を邪魔しない。
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
