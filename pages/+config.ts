import type { Config } from "vike/types";

// Prerender the static routes (/ and /project) at build time (`vike build`).
// The parameterized route /project/:projectId opts out via its own
// +prerender.ts and stays client-rendered through the Netlify SPA fallback.
export default {
  prerender: true,
} satisfies Config;
