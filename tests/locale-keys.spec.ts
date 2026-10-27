import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_PROJECT_STATES } from "@/constants/projectStates";

const SRC = resolve(__dirname, "../src");
const LOCALES = ["de", "en", "fr"] as const;

/**
 * Keys built from a template literal, which the literal scan below cannot see.
 * Each family lists the values it can actually take, so a missing state
 * translation fails the same way a missing literal key does.
 *
 * `StateBadge.vue` maps a project state to a camelCase suffix; the map is
 * duplicated here on purpose — if the two drift apart, this test is the only
 * thing that notices.
 */
const DYNAMIC_KEYS: Array<{ keys: () => string[]; source: string }> = [
  {
    source: "src/components/StateBadge.vue (t(`project.state.${key}`))",
    keys: () =>
      ALL_PROJECT_STATES.map((state) => {
        const camelCase = state === "under construction" ? "underConstruction" : state;
        return `project.state.${camelCase}`;
      }),
  },
];

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

/** `{name}` tokens in a message, sorted — the interpolation contract. */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

/** Flatten a locale tree into `"a.b.c" -> message`. */
function collectMessages(
  messages: unknown,
  found = new Map<string, string>(),
  prefix = "",
): Map<string, string> {
  if (!messages || typeof messages !== "object") return found;
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      found.set(path, value);
    } else if (value && typeof value === "object") {
      collectMessages(value, found, path);
    }
  }
  return found;
}

describe("locale keys", () => {
  const literalKeys = [...collectUsedKeys(SRC)].sort();
  const dynamicKeys = DYNAMIC_KEYS.flatMap((family) => family.keys());
  const usedKeys = [...new Set([...literalKeys, ...dynamicKeys])].sort();

  it("finds translation keys in the sources", () => {
    expect(usedKeys.length).toBeGreaterThan(50);
  });

  it.each(LOCALES)("defines every key used by the sources in %s", (locale) => {
    const messages = loadLocale(locale);
    const missing = usedKeys.filter((key) => lookup(messages, key) === undefined);
    expect(missing).toEqual([]);
  });

  it.each(LOCALES)("resolves every key to a string, not a group, in %s", (locale) => {
    const messages = loadLocale(locale);
    // `t("project.state")` finds an object and renders "[object Object]".
    const notStrings = usedKeys.filter(
      (key) => typeof lookup(messages, key) !== "string",
    );
    expect(notStrings).toEqual([]);
  });

  it("declares every dynamic key family that exists in the sources", () => {
    // Guards the other direction: a new template-literal `t()` must be listed
    // above, otherwise the suite silently stops covering it.
    const templateKeyCalls = readdirSync(SRC, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.(vue|ts)$/.test(file))
      .flatMap((file) => {
        const source = readFileSync(join(SRC, file), "utf8");
        return [...source.matchAll(/\bt\(\s*`([^`\\]+)\$\{/g)].map((match) => match[1]);
      });
    const declared = DYNAMIC_KEYS.map((family) => family.keys()[0].slice(0, family.keys()[0].lastIndexOf(".") + 1));
    expect([...new Set(templateKeyCalls)].sort()).toEqual([...new Set(declared)].sort());
  });

  it("uses the same placeholders in every locale", () => {
    const [reference, ...others] = LOCALES;
    const referenceMessages = collectMessages(loadLocale(reference));

    const mismatches: string[] = [];
    for (const locale of others) {
      const messages = collectMessages(loadLocale(locale));

      for (const key of usedKeys) {
        const expected = referenceMessages.get(key);
        const actual = messages.get(key);
        if (expected === undefined || actual === undefined) continue;
        if (placeholders(expected).join() !== placeholders(actual).join()) {
          mismatches.push(
            `${key}: ${reference} {${placeholders(expected).join(", ")}} vs ${locale} {${placeholders(actual).join(", ")}}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("compares placeholders for the keys it claims to check", () => {
    // A silent zero-pair comparison would make the test above meaningless.
    const [reference, other] = LOCALES;
    const referenceMessages = collectMessages(loadLocale(reference));
    const otherMessages = collectMessages(loadLocale(other));
    const compared = usedKeys.filter(
      (key) =>
        placeholders(referenceMessages.get(key) ?? "").length > 0 &&
        otherMessages.has(key),
    );
    expect(compared.length).toBeGreaterThan(5);
  });
});
