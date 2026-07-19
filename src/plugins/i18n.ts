import { createI18n } from "vue-i18n";

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

// Lazy loading function for locale messages
async function loadLocaleMessages(locale: Locale) {
  try {
    const messages = await import(`@/locales/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    // Fallback to English if the locale fails to load
    const fallbackMessages = await import(`@/locales/en.json`);
    return fallbackMessages.default;
  }
}

// Missing translation handler
function handleMissingTranslation(locale: string, key: string) {
  // Log missing translations in development
  if (import.meta.env.DEV) {
    console.warn(`Missing translation: ${locale}.${key}`);
  }
  return key; // Fallback to key
}

// Create i18n instance with missing handler
export const i18n = createI18n({
  locale: loadSavedLocale(),
  fallbackLocale: "en",
  messages: {},
  legacy: false,
  // Missing translation handler
  missing: handleMissingTranslation,
});

// Load and set locale messages (async)
async function loadAndSetLocaleMessages(locale: Locale): Promise<void> {
  const messages = await loadLocaleMessages(locale);
  i18n.global.setLocaleMessage(locale, messages);
}

// Initialize the current locale messages
export async function initializeLocale(): Promise<void> {
  const currentLocale = loadSavedLocale();
  await loadAndSetLocaleMessages(currentLocale);
}

// Set locale synchronously (loads messages in background)
export function setLocale(locale: Locale): void {
  // Set the locale immediately
  (i18n.global.locale as unknown as { value: string }).value = locale;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
  }
  
  // Load messages in background
  loadAndSetLocaleMessages(locale).catch(error => {
    console.error("Failed to load locale messages:", error);
  });
}
