// Minimal service worker — its only job is to exist and handle fetch, which
// is what makes Chrome/Android treat the site as installable. No caching
// strategy on purpose: the app has no offline mode yet, so caching stale
// pages would do more harm than good.
self.addEventListener("fetch", () => {});
