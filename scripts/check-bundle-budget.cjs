/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DIST_DIR = path.join(__dirname, "..", "dist", "assets");

const INITIAL_JS_MAX = 300 * 1024;
const ASYNC_CHUNK_MAX = 150 * 1024;
const TOTAL_CSS_MAX = 150 * 1024;

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(1) + " kB";
}

function run() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn("⚠️  dist/assets not found. Run build first.");
    return;
  }

  const files = fs.readdirSync(DIST_DIR);

  let initialJsSize = 0;
  let totalCssSize = 0;

  const jsFiles = files.filter((f) => f.endsWith(".js"));
  const cssFiles = files.filter((f) => f.endsWith(".css"));

  jsFiles.forEach((file) => {
    const filePath = path.join(DIST_DIR, file);
    const content = fs.readFileSync(filePath);
    const gzSize = gzipSize(content);

    const isInitial =
      file.startsWith("index-") ||
      file.includes("vendor-vue-core") ||
      file.includes("vendor-vue-router") ||
      file.includes("vendor-pinia") ||
      file.includes("vendor-bootstrap-vue");

    if (isInitial) {
      initialJsSize += gzSize;
    } else {
      if (gzSize > ASYNC_CHUNK_MAX) {
        console.warn(
          `⚠ Async chunk budget exceeded: ${file} → ${formatKB(gzSize)} (max ${formatKB(
            ASYNC_CHUNK_MAX,
          )})`,
        );
      }
    }
  });

  cssFiles.forEach((file) => {
    const filePath = path.join(DIST_DIR, file);
    const content = fs.readFileSync(filePath);
    const gzSize = gzipSize(content);
    totalCssSize += gzSize;
  });

  if (initialJsSize > INITIAL_JS_MAX) {
    console.warn(
      `⚠ Initial JS budget exceeded → ${formatKB(initialJsSize)} (max ${formatKB(
        INITIAL_JS_MAX,
      )})`,
    );
  }

  if (totalCssSize > TOTAL_CSS_MAX) {
    console.warn(
      `⚠ Total CSS budget exceeded → ${formatKB(totalCssSize)} (max ${formatKB(
        TOTAL_CSS_MAX,
      )})`,
    );
  }

  console.log("✅ Bundle budget check complete.");
}

run();
