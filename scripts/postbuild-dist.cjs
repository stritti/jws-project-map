// Post-process the Vike build output (dist/client) after `vike build`:
//
// 1. Remove the `async` attribute from the injected module entry scripts.
//    Vike hardcodes `type="module" async` (for streaming hydration). An async
//    script can execute before the render-blocking CSS has loaded, so the app
//    mounts unstyled and the reflow shows up as a large CLS. A plain deferred
//    module script (what Vite's own build produced before) waits for pending
//    stylesheets, keeping the first paint styled.
//
// 2. Add the prerendered HTML files to the service worker precache.
//    vite-plugin-pwa generates sw.js during the client build — before Vike
//    prerenders the HTML files — and its default navigateFallback
//    ("index.html") makes the SW throw at install time when index.html is
//    not precached. Vike's prerendered pages must therefore be added to the
//    precache manifest afterwards, with md5 revisions (workbox format).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DIST_CLIENT = path.join(__dirname, "..", "dist", "client");

function collectFiles(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

function run() {
  if (!fs.existsSync(DIST_CLIENT)) {
    console.warn("⚠️  dist/client not found. Run build first.");
    return;
  }

  // 1. strip `async` from module entry scripts in the prerendered HTML
  const htmlFiles = collectFiles(DIST_CLIENT, ".html");
  let strippedCount = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf-8");
    const stripped = html.replace(
      /<script([^>]*?)\stype="module" async([^>]*?)>/g,
      '<script$1 type="module"$2>',
    );
    if (stripped !== html) {
      fs.writeFileSync(file, stripped);
      strippedCount++;
    }
  }

  // 2. precache the (prerendered) HTML files in the generated service worker
  const swPath = path.join(DIST_CLIENT, "sw.js");
  let precachedCount = 0;
  if (fs.existsSync(swPath) && htmlFiles.length > 0) {
    let sw = fs.readFileSync(swPath, "utf-8");
    const newEntries = [];
    for (const file of htmlFiles) {
      const rel = path.relative(DIST_CLIENT, file).split(path.sep).join("/");
      if (sw.includes(`url:"${rel}"`)) continue;
      const md5 = crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex");
      newEntries.push(`{url:${JSON.stringify(rel)},revision:${JSON.stringify(md5)}}`);
    }
    if (newEntries.length > 0) {
      const marker = "precacheAndRoute([";
      const idx = sw.indexOf(marker);
      if (idx === -1) {
        console.warn("⚠️  could not find precacheAndRoute() in sw.js — HTML not precached");
      } else {
        sw = sw.slice(0, idx + marker.length) + newEntries.join(",") + "," + sw.slice(idx + marker.length);
        fs.writeFileSync(swPath, sw);
        precachedCount = newEntries.length;
      }
    }
  }

  console.log(
    `✅ postbuild: stripped async from ${strippedCount} HTML file(s), precached ${precachedCount} HTML file(s) in sw.js`,
  );
}

run();
