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

export const i18n = createI18n<[typeof de], Locale>({
  locale: detectBrowserLocale(),
  fallbackLocale: "en",
  messages: { de, en, fr },
  legacy: false,
});
