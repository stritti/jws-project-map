#!/usr/bin/env node

/**
 * Generates `public/sitemap.xml` by fetching project data from NocoDB.
 *
 * Runs at build time.  Falls back gracefully (no-op) when the required
 * environment variables are not set, so local dev builds don't break.
 *
 * URL format (matches slug.ts):  /project/<slug>-<id>
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// ── Config ──────────────────────────────────────────────────────────
const TABLE_ID = "mdctuswlmsfvi8i";
const VIEW_ID  = "vwlnl4t095iifqc9";

// Environment — these must be set in the Netlify build environment
const BASE_URL   = process.env.VITE_APP_NOCODB_URL;
const TOKEN      = process.env.VITE_APP_NOCODB_TOKEN;
const BASE_ID    = process.env.VITE_APP_NOCODB_BASE_ID;

// The canonical site URL (set by Netlify or fallback)
const SITE_URL = process.env.URL || "https://jws-projects-map.netlify.app";

// ── Helpers ─────────────────────────────────────────────────────────

/** Bare‑bones slugify matching slug.ts (no external deps). */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function projectUrl(project) {
  const slug = slugify(project.Name || "");
  const id = project.id;
  // Ensure id is a number; NocoDB sometimes returns string ids
  const numId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (!slug || isNaN(numId)) return null;
  return `${SITE_URL}/project/${slug}-${numId}`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Fetch projects from NocoDB ──────────────────────────────────────

async function fetchProjects() {
  const url = `${BASE_URL}/api/v3/data/${BASE_ID}/${TABLE_ID}/records`;
  const params = new URLSearchParams({
    fields: "Name",
    viewId: VIEW_ID,
    limit: "500",
  });

  const res = await fetch(`${url}?${params}`, {
    headers: {
      "xc-token": TOKEN,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`NocoDB fetch failed (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();

  // NocoDB v3 returns { list: [...] } or { records: [...] }
  const records = data?.list ?? data?.records ?? [];

  // Each record: { id, fields: { Name } }
  return records.map((r) => ({
    id: r.id ?? r.Id,
    Name: r.fields?.Name ?? r.Name ?? "",
  }));
}

// ── Build XML ───────────────────────────────────────────────────────

function buildSitemap(projects) {
  const urls = [
    // Static pages
    { loc: `${SITE_URL}/`,               priority: "1.0", changefreq: "weekly" },
    { loc: `${SITE_URL}/project/`,       priority: "0.8", changefreq: "weekly" },
  ];

  // Project detail pages
  for (const p of projects) {
    const loc = projectUrl(p);
    if (loc) {
      urls.push({ loc, priority: "0.6", changefreq: "monthly" });
    }
  }

  const urlElements = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
   </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!BASE_URL || !TOKEN || !BASE_ID) {
    console.log(
      "[sitemap] Skipping – VITE_APP_NOCODB_URL/TOKEN/BASE_ID not set.",
    );
    return;
  }

  try {
    const projects = await fetchProjects();
    console.log(`[sitemap] Fetched ${projects.length} projects from NocoDB`);

    const xml = buildSitemap(projects);

    const outPath = resolve("public/sitemap.xml");
    const outDir = dirname(outPath);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    writeFileSync(outPath, xml, "utf-8");
    console.log(`[sitemap] Written ${outPath} (${xml.length} bytes)`);
  } catch (err) {
    console.error("[sitemap] Error:", err.message);
    // Don't fail the build — a missing sitemap is better than a broken one
  }
}

main();
