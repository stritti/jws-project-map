import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_URL,
  canonicalUrlFor,
  PROJECT_SHELL_FILE,
  PROJECT_SHELL_ROUTE,
  checkProjectShellHtml,
  checkSeoHtml,
  checkSeoOutput,
  routeForFile,
} from "../scripts/check-seo-output";

const SITE = DEFAULT_SITE_URL;

function page(overrides: { head?: string; canonical?: string; lang?: string } = {}): string {
  const canonical = overrides.canonical ?? SITE;
  const lang = overrides.lang ?? "en";
  const head =
    overrides.head ??
    `<title>Map — JWS Project Map</title>
    <meta name="description" content="Projects in West Africa">
    <meta name="robots" content="index, follow">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Map — JWS Project Map">
    <meta property="og:description" content="Projects in West Africa">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/img/logo.png">
    <meta property="og:site_name" content="Jörg Wolff Foundation">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Map — JWS Project Map">
    <meta name="twitter:description" content="Projects in West Africa">
    <meta name="twitter:image" content="${SITE}/img/logo.png">
    <link rel="canonical" href="${canonical}">`;
  return `<!doctype html><html lang="${lang}"><head>${head}</head><body><div id="app"><h1>Projects in West Africa</h1></div>
    <script id="vike_pageContext" type="application/json">{}</script></body></html>`;
}

describe("canonicalUrlFor / routeForFile", () => {
  it("maps the root route to the bare site URL", () => {
    expect(canonicalUrlFor("/")).toBe(SITE);
    expect(canonicalUrlFor("/project/")).toBe(`${SITE}/project`);
  });

  it("derives routes from prerendered file paths", () => {
    expect(routeForFile("index.html")).toBe("/");
    expect(routeForFile(join("project", "index.html"))).toBe("/project");
    expect(routeForFile("about.html")).toBe("/about");
  });
});

describe("checkSeoHtml", () => {
  it("accepts a complete page", () => {
    expect(checkSeoHtml(page(), SITE)).toEqual([]);
  });

  it("reports a missing lang, title and canonical", () => {
    const errors = checkSeoHtml(page({ lang: "", head: "" }), SITE);
    expect(errors).toContain("<html> has no lang attribute");
    expect(errors).toContain("expected 1 <title>, found 0");
    expect(errors).toContain('expected 1 <link rel="canonical">, found 0');
  });

  it("reports a canonical and og:url pointing at another route", () => {
    const errors = checkSeoHtml(page({ canonical: SITE }), `${SITE}/project`);
    expect(errors).toContain(`canonical is "${SITE}", expected "${SITE}/project"`);
    expect(errors).toContain(`og:url is "${SITE}", expected "${SITE}/project"`);
  });

  it("reports a missing or second <h1>", () => {
    expect(checkSeoHtml(page().replace("<h1>Projects in West Africa</h1>", ""), SITE)).toContain("expected 1 <h1>, found 0");
    const withShellHeading = page().replace("<body>", "<body><div id=\"app-shell\"><h1>Loading</h1></div>");
    expect(checkSeoHtml(withShellHeading, SITE)).toContain("expected 1 <h1>, found 2");
  });

  it("reports duplicated tags from a broken head merge", () => {
    const html = page().replace("</head>", '<meta name="description" content="again"><meta name="theme-color" content="#000"><meta name="theme-color" content="#000"></head>');
    const errors = checkSeoHtml(html, SITE);
    expect(errors).toContain('expected 1 <meta name="description">, found 2');
    expect(errors).toContain('<meta name="theme-color"> appears 2 times');
  });

  it("reports relative images, noindex and invalid JSON-LD", () => {
    const html = page()
      .replaceAll(`${SITE}/img/logo.png`, "/img/logo.png")
      .replace("index, follow", "noindex")
      .replace("</body>", '<script type="application/ld+json">{oops</script></body>');
    const errors = checkSeoHtml(html, SITE);
    expect(errors).toContain('og:image is not an absolute https URL: "/img/logo.png"');
    expect(errors).toContain('twitter:image is not an absolute https URL: "/img/logo.png"');
    expect(errors).toContain('robots meta blocks indexing: "noindex"');
    expect(errors).toContain("JSON-LD block #1 is not valid JSON");
  });
});

describe("checkProjectShellHtml", () => {
  const shell = page()
    .replace(/<link rel="canonical"[^>]*>/, "")
    .replace(/<meta property="og:url"[^>]*>/, "")
    .replace("<title>Map — JWS Project Map</title>", "<title>Project — JWS Project Map</title>")
    .replace("<h1>Projects in West Africa</h1>", "");

  it("accepts a neutral shell", () => {
    expect(checkProjectShellHtml(shell, "Map — JWS Project Map")).toEqual([]);
  });

  it("rejects the home page served as the shell", () => {
    const errors = checkProjectShellHtml(page(), "Map — JWS Project Map");
    expect(errors).toContain('<title> is the home page\'s title "Map — JWS Project Map"');
    expect(errors).toContain("has a canonical link");
    expect(errors).toContain("has an og:url");
    expect(errors).toContain("#app is not empty");
    expect(errors).toContain("contains an <h1>");
  });
});

describe("checkSeoOutput", () => {
  let dir: string | undefined;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("checks Vike pages, skips static HTML and reports missing routes", () => {
    dir = mkdtempSync(join(tmpdir(), "seo-output-"));
    writeFileSync(join(dir, "index.html"), page());
    writeFileSync(join(dir, "iframe-preview.html"), "<html><head></head><body></body></html>");

    const results = checkSeoOutput(dir);
    expect(results.get("/")).toEqual([]);
    expect(results.has("/iframe-preview")).toBe(false);
    expect(results.get("/project")).toEqual(["route was not prerendered"]);
    expect(results.get(PROJECT_SHELL_ROUTE)).toEqual([`${PROJECT_SHELL_FILE} was not written`]);

    mkdirSync(join(dir, "project"));
    writeFileSync(join(dir, "project", "index.html"), page({ canonical: `${SITE}/project` }));
    expect(checkSeoOutput(dir).get("/project")).toEqual([]);

    // the shell is checked as a shell, not as a prerendered route
    writeFileSync(join(dir, PROJECT_SHELL_FILE), page());
    const withShell = checkSeoOutput(dir);
    expect(withShell.has("/project-shell")).toBe(false);
    expect(withShell.get(PROJECT_SHELL_ROUTE)).toContain("has a canonical link");
  });
});
