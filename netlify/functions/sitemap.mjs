/**
 * Netlify serverless function — live sitemap.xml
 *
 * Fetches projects from NocoDB on every request so newly added, renamed,
 * or deleted projects are reflected immediately — no build needed.
 *
 * Called via redirect:  /sitemap.xml  →  /.netlify/functions/sitemap
 */

// ── Config (mirrors src/repositories/project.repository.ts) ─────────
const TABLE_ID = "mdctuswlmsfvi8i";
const VIEW_ID  = "vwlnl4t095iifqc9";

// ── Helpers ─────────────────────────────────────────────────────────

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

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── NocoDB client ───────────────────────────────────────────────────

async function fetchProjects(baseUrl, token, baseId) {
  const url = `${baseUrl}/api/v3/data/${baseId}/${TABLE_ID}/records`;
  const params = new URLSearchParams({
    fields: "Name",
    viewId: VIEW_ID,
    limit: "500",
  });

  const res = await fetch(`${url}?${params}`, {
    headers: {
      "xc-token": token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`NocoDB returned ${res.status}`);
  }

  const data = await res.json();
  const records = data?.list ?? data?.records ?? [];

  return records.map((r) => ({
    id: r.id ?? r.Id,
    Name: r.fields?.Name ?? r.Name ?? "",
  }));
}

// ── XML builder ─────────────────────────────────────────────────────

function buildSitemap(siteUrl, projects) {
  const urls = [];

  // Static pages
  urls.push({ loc: siteUrl,                          priority: "1.0", changefreq: "weekly" });
  urls.push({ loc: `${siteUrl}/project/`,            priority: "0.8", changefreq: "weekly" });

  // Project detail pages
  for (const p of projects) {
    const slug = slugify(p.Name || "");
    const numId = typeof p.id === "number" ? p.id : parseInt(String(p.id), 10);
    if (slug && !isNaN(numId)) {
      urls.push({
        loc: `${siteUrl}/project/${slug}-${numId}`,
        priority: "0.6",
        changefreq: "monthly",
      });
    }
  }

  const urlElements = urls
    .map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
   </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

// ── Handler ─────────────────────────────────────────────────────────

export default async (req, context) => {
  // CORS headers for direct access
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const baseUrl  = process.env.VITE_APP_NOCODB_URL;
    const token    = process.env.VITE_APP_NOCODB_TOKEN;
    const baseId   = process.env.VITE_APP_NOCODB_BASE_ID;
    // Netlify injects the deploy URL automatically as process.env.URL
    const siteUrl  = process.env.URL
      ? process.env.URL.replace(/\/$/, "")
      : "https://jws-projects-map.netlify.app";

    if (!baseUrl || !token || !baseId) {
      return new Response(
        "<!-- sitemap: missing NocoDB env vars -->\n",
        { status: 200, headers },
      );
    }

    const projects = await fetchProjects(baseUrl, token, baseId);
    const xml = buildSitemap(siteUrl, projects);

    return new Response(xml, { status: 200, headers });
  } catch (err) {
    console.error("[sitemap function] Error:", err);
    return new Response(
      "<!-- sitemap generation failed -->\n",
      { status: 200, headers },
    );
  }
};
