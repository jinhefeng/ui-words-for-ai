import { analyticsConfig } from "./analytics-config.js";

let initialized = false;

export function initAnalytics() {
  const websiteId = analyticsConfig.websiteId.trim();
  if (initialized || !websiteId || document.querySelector("script[data-ui-words-analytics]")) return;

  const hostname = window.location.hostname;
  if (analyticsConfig.domains.length && !analyticsConfig.domains.includes(hostname)) return;

  const script = document.createElement("script");
  script.src = analyticsConfig.scriptUrl;
  script.async = true;
  script.dataset.websiteId = websiteId;
  script.dataset.domains = analyticsConfig.domains.join(",");
  script.dataset.doNotTrack = "true";
  script.dataset.excludeSearch = "true";
  script.dataset.uiWordsAnalytics = "umami";
  document.head.append(script);
  initialized = true;
}
