import { i18n, type Locale } from "@/plugins/i18n";

/**
 * Resolve the current active locale from the vue-i18n instance.
 *
 * Centralises the awkward `i18n.global.locale as unknown as { value: string }`
 * cast that was previously duplicated across stores and services.
 *
 * Falls back to "en" when the locale cannot be read.
 */
export function currentLocale(): Locale {
  try {
    const loc = (i18n.global.locale as unknown as { value: string }).value;
    if (loc && typeof loc === "string") return loc as Locale;
  } catch {
    // i18n may not be initialised yet during eager store setup
  }
  return "en";
}
