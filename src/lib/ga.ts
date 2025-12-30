export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-CBSZ45019Y";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const PROJECT_NAME = "garoop_novel";

export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  const params = {
    page_path: url,
    page_title: document.title,
    page_location: window.location.href,
    project: PROJECT_NAME,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", params);
    return;
  }

  window.dataLayer.push(["event", "page_view", params]);
};

type EventParams = Record<string, unknown>;

export const trackEvent = (name: string, params: EventParams = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  const baseParams = {
    page_path: window.location.pathname,
    page_location: window.location.href,
    project: PROJECT_NAME,
  };
  const eventParams = { ...baseParams, ...params };

  if (typeof window.gtag === "function") {
    window.gtag("event", name, eventParams);
    return;
  }

  window.dataLayer.push(["event", name, eventParams]);
};
