import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(__dirname, "../src");
const LOCALES = ["de", "en", "fr"] as const;

/** Every `t("a.b")` literal in the sources, e.g. `project.detail.country`. */
function collectUsedKeys(dir: string, found = new Set<string>()): Set<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectUsedKeys(path, found);
      continue;
    }
    if (!/\.(vue|ts)$/.test(entry.name)) continue;
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(/\bt\(\s*["']([\w.-]+\.[\w.-]+)["']/g)) {
      found.add(match[1]);
    }
  }
  return found;
}

function lookup(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function loadLocale(locale: string): unknown {
  return JSON.parse(
    readFileSync(resolve(__dirname, `../src/locales/${locale}.json`), "utf8"),
  );
}

describe("locale keys", () => {
  const usedKeys = [...collectUsedKeys(SRC)].sort();

  it("finds translation keys in the sources", () => {
    expect(usedKeys.length).toBeGreaterThan(50);
  });

  it.each(LOCALES)("defines every key used by the sources in %s", (locale) => {
    const messages = loadLocale(locale);
    const missing = usedKeys.filter((key) => lookup(messages, key) === undefined);
    expect(missing).toEqual([]);
  });
});
