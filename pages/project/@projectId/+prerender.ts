// Dynamic project detail routes are not prerendered: they stay
// client-rendered via the Netlify SPA fallback (/* -> /index.html 200),
// where vue-router picks the project id from the URL.
export const prerender = false;
