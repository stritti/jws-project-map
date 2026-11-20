// Post-build check of the SEO head tags in the prerendered HTML (dist/client).
//
// Vike prerenders the static routes and pages/+onRenderHtml.ts merges the
// unhead tags into the index.html shell. Nothing else verifies that output, so
// a regression in that pipeline (a missing route, a tag dropped or duplicated
// by the merge, a canonical pointing at the wrong URL) would only show up in
// search results. This script fails the build when that happens.
//
// Usage: bun scripts/check-seo-output.ts   (after `bun run build`)
// The site URL defaults to the production URL; VITE_SITE_URL overrides it,
// the same as in src/composables/useCanonicalUrl.ts.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { JSDOM } from "jsdom";

export const DEFAULT_SITE_URL = "https://jws-projects-map.netlify.app";

// Routes that must be prerendered (pages/+config.ts). /project/:projectId is
// client-rendered on purpose (pages/project/@projectId/+prerender.ts).
export const REQUIRED_ROUTES = ["/", "/project"];

// Neutral shell served for client-rendered /project/:projectId URLs
// (written by scripts/postbuild-dist.cjs, routed in netlify.toml).
export const PROJECT_SHELL_FILE = "project-shell.html";
export const PROJECT_SHELL_ROUTE = "/project/:projectId (shell)";

// Head tags every prerendered page must carry exactly once, with content.
const REQUIRED_META: Array<[attr: "name" | "property", key: string]> = [
  ["name", "description"],
  ["property", "og:type"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"],
  ["property", "og:image"],
  ["property", "og:site_name"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
];

/** Canonical URL for a route, built the same way as useCanonicalUrl(). */
export function canonicalUrlFor(route: string, siteUrl = DEFAULT_SITE_URL): string {
  return route === "/" ? siteUrl : `${siteUrl}${route.replace(/\/$/, "")}`;
}

/** Route served by a prerendered file, e.g. "project/index.html" → "/project". */
export function routeForFile(relativePath: string): string {
  const parts = relativePath.split(sep).join("/").replace(/(^|\/)index\.html$/, "");
  return `/${parts.replace(/\.html$/, "")}`.replace(/\/$/, "") || "/";
}

function isAbsoluteHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns a list of problems in one prerendered HTML document (empty = OK). */
export function checkSeoHtml(html: string, expectedCanonical: string): string[] {
  const { document } = new JSDOM(html).window;
  const head = document.head;
  const errors: string[] = [];

  if (!document.documentElement.getAttribute("lang")?.trim()) {
    errors.push("<html> has no lang attribute");
  }

  const titles = head.querySelectorAll("title");
  if (titles.length !== 1) {
    errors.push(`expected 1 <title>, found ${titles.length}`);
  } else if (!titles[0].textContent?.trim()) {
    errors.push("<title> is empty");
  }

  for (const [attr, key] of REQUIRED_META) {
    const tags = head.querySelectorAll(`meta[${attr}="${key}"]`);
    if (tags.length !== 1) {
      errors.push(`expected 1 <meta ${attr}="${key}">, found ${tags.length}`);
    } else if (!tags[0].getAttribute("content")?.trim()) {
      errors.push(`<meta ${attr}="${key}"> is empty`);
    }
  }

  // Any other meta tag repeated with the same key means the unhead merge in
  // +onRenderHtml.ts stopped deduplicating against the index.html shell.
  const seen = new Map<string, number>();
  for (const meta of head.querySelectorAll("meta[name], meta[property]")) {
    const key = meta.hasAttribute("property")
      ? `property="${meta.getAttribute("property")}"`
      : `name="${meta.getAttribute("name")}"`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [key, count] of seen) {
    const isRequired = REQUIRED_META.some(([a, k]) => key === `${a}="${k}"`);
    if (count > 1 && !isRequired) errors.push(`<meta ${key}> appears ${count} times`);
  }

  const canonicals = head.querySelectorAll('link[rel="canonical"]');
  if (canonicals.length !== 1) {
    errors.push(`expected 1 <link rel="canonical">, found ${canonicals.length}`);
  } else {
    const href = canonicals[0].getAttribute("href") ?? "";
    if (href !== expectedCanonical) {
      errors.push(`canonical is "${href}", expected "${expectedCanonical}"`);
    }
  }

  const ogUrl = head.querySelector('meta[property="og:url"]')?.getAttribute("content");
  if (ogUrl && ogUrl !== expectedCanonical) {
    errors.push(`og:url is "${ogUrl}", expected "${expectedCanonical}"`);
  }

  for (const key of ["og:image", "twitter:image"]) {
    const attr = key.startsWith("og:") ? "property" : "name";
    const value = head.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content");
    if (value && !isAbsoluteHttpsUrl(value)) {
      errors.push(`${key} is not an absolute https URL: "${value}"`);
    }
  }

  const robots = head.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
  if (/noindex/i.test(robots)) {
    errors.push(`robots meta blocks indexing: "${robots}"`);
  }

  // One <h1> per page: the index.html loading shell sits next to the
  // prerendered page, so a heading there would give every page a second one.
  const h1Count = document.body.querySelectorAll("h1").length;
  if (h1Count !== 1) {
    errors.push(`expected 1 <h1>, found ${h1Count}`);
  }

  document.querySelectorAll('script[type="application/ld+json"]').forEach((script, i) => {
    try {
      JSON.parse(script.textContent ?? "");
    } catch {
      errors.push(`JSON-LD block #${i + 1} is not valid JSON`);
    }
  });

  return errors;
}

/**
 * Problems in the neutral project shell (empty = OK). It serves every project
 * URL, so it must not claim one canonical URL, must not reuse the home
 * page's title, and must not carry the home page's content.
 */
export function checkProjectShellHtml(html: string, homeTitle?: string): string[] {
  const { document } = new JSDOM(html).window;
  const head = document.head;
  const errors: string[] = [];

  if (!document.documentElement.getAttribute("lang")?.trim()) {
    errors.push("<html> has no lang attribute");
  }
  const title = head.querySelector("title")?.textContent?.trim() ?? "";
  if (!title) errors.push("<title> is missing or empty");
  if (homeTitle && title === homeTitle) errors.push(`<title> is the home page's title "${title}"`);
  if (head.querySelector('link[rel="canonical"]')) errors.push("has a canonical link");
  if (head.querySelector('meta[property="og:url"]')) errors.push("has an og:url");
  if (!head.querySelector('meta[name="description"]')?.getAttribute("content")?.trim()) {
    errors.push('<meta name="description"> is missing or empty');
  }
  if (/noindex/i.test(head.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "")) {
    errors.push("robots meta blocks indexing");
  }
  if (document.getElementById("app")?.children.length) errors.push("#app is not empty");
  if (document.body.querySelector("h1")) errors.push("contains an <h1>");
  return errors;
}

function collectHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

// Vike embeds this script in every page it renders. Static HTML copied from
// public/ (e.g. iframe-preview.html) lacks it and is not checked.
const VIKE_PAGE_MARKER = 'id="vike_pageContext"';

/** Checks every page Vike prerendered into distDir; returns problems per route. */
export function checkSeoOutput(distDir: string, siteUrl = DEFAULT_SITE_URL): Map<string, string[]> {
  const results = new Map<string, string[]>();
  const routes = new Map<string, string>();
  for (const file of existsSync(distDir) ? collectHtmlFiles(distDir) : []) {
    const html = readFileSync(file, "utf8");
    if (relative(distDir, file) === PROJECT_SHELL_FILE) continue;
    if (html.includes(VIKE_PAGE_MARKER)) routes.set(routeForFile(relative(distDir, file)), html);
  }

  for (const route of REQUIRED_ROUTES) {
    if (!routes.has(route)) results.set(route, ["route was not prerendered"]);
  }
  for (const [route, html] of routes) {
    results.set(route, checkSeoHtml(html, canonicalUrlFor(route, siteUrl)));
  }

  const shellFile = join(distDir, PROJECT_SHELL_FILE);
  if (!existsSync(shellFile)) {
    results.set(PROJECT_SHELL_ROUTE, [`${PROJECT_SHELL_FILE} was not written`]);
  } else {
    const homeHtml = routes.get("/");
    const homeTitle = homeHtml ? new JSDOM(homeHtml).window.document.title.trim() : undefined;
    results.set(PROJECT_SHELL_ROUTE, checkProjectShellHtml(readFileSync(shellFile, "utf8"), homeTitle));
  }
  return results;
}

if (import.meta.main) {
  const distDir = join(import.meta.dir, "..", "dist", "client");
  const siteUrl = process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL;
  const results = checkSeoOutput(distDir, siteUrl);
  let failed = 0;
  for (const [route, errors] of results) {
    if (errors.length === 0) {
      console.log(`✅ ${route}`);
      continue;
    }
    failed++;
    console.error(`❌ ${route}`);
    for (const error of errors) console.error(`   - ${error}`);
  }
  if (failed > 0) {
    console.error(`\nSEO check failed for ${failed} of ${results.size} prerendered page(s).`);
    process.exit(1);
  }
  console.log(`\nSEO check passed for ${results.size} prerendered page(s).`);
}
