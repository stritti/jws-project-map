import { createI18n } from "vue-i18n";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

export type Locale = "de" | "en" | "fr";

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const raw = navigator.language?.split("-")[0] ?? "en";
  return (["de", "en", "fr"] as Locale[]).includes(raw as Locale)
    ? (raw as Locale)
    : "en";
}

const STORAGE_KEY = "jws-locale";

function loadSavedLocale(): Locale {
  if (typeof localStorage === "undefined") return detectBrowserLocale();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (["de", "en", "fr"] as Locale[]).includes(saved as Locale)) {
    return saved as Locale;
  }
  return detectBrowserLocale();
}

export const i18n = createI18n<[typeof de], Locale>({
  locale: loadSavedLocale(),
  fallbackLocale: "en",
  messages: { de, en, fr },
  legacy: false,
});

export function setLocale(locale: Locale): void {
  (i18n.global.locale as unknown as { value: string }).value = locale;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
  }
}
