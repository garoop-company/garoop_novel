"use client";

import type { ComponentProps } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/ga";

type GaLinkProps = ComponentProps<typeof Link> & {
  eventName?: string;
  eventParams?: Record<string, unknown>;
};

export default function GaLink({
  eventName = "cta_click",
  eventParams,
  onClick,
  ...rest
}: GaLinkProps) {
  const handleClick: GaLinkProps["onClick"] = (event) => {
    trackEvent(eventName, eventParams ?? {});
    onClick?.(event);
  };

  return <Link {...rest} onClick={handleClick} />;
}
