const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Vike writes the client build (the deployable static assets) to dist/client
const DIST_DIR = path.join(__dirname, "..", "dist", "client", "assets");

const INITIAL_JS_MAX = 300 * 1024;
const ASYNC_CHUNK_MAX = 150 * 1024;
const TOTAL_CSS_MAX = 500 * 1024;  // Increased for Tailwind CSS

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(1) + " kB";
}

function collectFiles(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

function run() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn("⚠️  dist/client/assets not found. Run build first.");
    return;
  }

  let initialJsSize = 0;
  let totalCssSize = 0;

  const jsFiles = collectFiles(DIST_DIR, ".js");
  const cssFiles = collectFiles(DIST_DIR, ".css");

  jsFiles.forEach((filePath) => {
    const file = path.basename(filePath);
    const rel = path.relative(DIST_DIR, filePath);
    const content = fs.readFileSync(filePath);
    const gzSize = gzipSize(content);

    const isInitial =
      file.startsWith("index-") ||
      file.startsWith("app-") ||
      rel.includes("entries") ||
      file.includes("_onRenderClient") ||
      file.includes("vendor-vue-core") ||
      file.includes("vendor-vue-router") ||
      file.includes("vendor-pinia") ||
      file.includes("vendor-tailwind") ||
      file.includes("rolldown-runtime") ||
      file.includes("_plugin-vue") ||
      file.includes("main");

    if (isInitial) {
      initialJsSize += gzSize;
    } else {
      if (gzSize > ASYNC_CHUNK_MAX) {
        console.warn(
          `⚠️ Async chunk budget exceeded: ${rel} → ${formatKB(gzSize)} (max ${formatKB(
            ASYNC_CHUNK_MAX,
          )})`,
        );
      }
    }
  });

  cssFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath);
    const gzSize = gzipSize(content);
    totalCssSize += gzSize;
  });

  if (initialJsSize > INITIAL_JS_MAX) {
    console.warn(
      `⚠️ Initial JS budget exceeded → ${formatKB(initialJsSize)} (max ${formatKB(
        INITIAL_JS_MAX,
      )})`,
    );
  }

  if (totalCssSize > TOTAL_CSS_MAX) {
    console.warn(
      `⚠️ Total CSS budget exceeded → ${formatKB(totalCssSize)} (max ${formatKB(
        TOTAL_CSS_MAX,
      )})`,
    );
  }

  console.log("✅ Bundle budget check complete.");
}

run();
