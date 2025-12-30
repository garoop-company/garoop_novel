"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent, trackPageView } from "@/lib/ga";

export default function GaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastGamePathRef = useRef<string | null>(null);

  const getGameIdFromPath = (path: string) => {
    if (path.startsWith("/game/")) {
      const [, , gameId] = path.split("/");
      return gameId || null;
    }
    if (path.startsWith("/games/")) {
      const [, , gameId] = path.split("/");
      return gameId || null;
    }
    return null;
  };

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    trackPageView(url);

    const gameId = getGameIdFromPath(pathname);
    if (gameId && lastGamePathRef.current !== pathname) {
      lastGamePathRef.current = pathname;
      trackEvent("game_start", { game: gameId });
    }
    if (!gameId) {
      lastGamePathRef.current = null;
    }
  }, [pathname, searchParams]);

  return null;
}
