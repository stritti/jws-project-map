import { ref, watch } from "vue"

// 	 Singleton live region for screen reader announcements 											
let liveRegion: HTMLElement | null = null

function getLiveRegion(): HTMLElement {
  if (liveRegion && document.body.contains(liveRegion)) return liveRegion

  liveRegion = document.createElement("div")
  liveRegion.setAttribute("aria-live", "polite")
  liveRegion.setAttribute("aria-atomic", "true")
  liveRegion.className = "sr-only"
  liveRegion.id = "a11y-live-region"
  document.body.appendChild(liveRegion)
  return liveRegion
}

/**
 * Announce a message to screen readers via an aria-live region.
 */
export function announceToScreenReader(message: string): void {
  const region = getLiveRegion()
  // Clear first so screen readers pick up the new content
  region.textContent = ""
  requestAnimationFrame(() => {
    region.textContent = message
  })
}

// 	 Focus restore helper 																													
/**
 * Helper to restore focus to the element that triggered a modal/dialog.
 * Call setTrigger() before opening the modal, and restoreFocus() when closing it.
 */
export function useFocusRestore() {
  const triggerElement = ref<HTMLElement | null>(null)

  function setTrigger() {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      triggerElement.value = active
    }
  }

  function restoreFocus() {
    if (
      triggerElement.value &&
      document.body.contains(triggerElement.value) &&
      typeof triggerElement.value.focus === "function"
    ) {
      // Never scroll the page: the trigger usually sits where the user left it
      // and a plain focus() would jump it into view.
      triggerElement.value.focus({ preventScroll: true })
    }
    triggerElement.value = null
  }

  return { triggerElement, setTrigger, restoreFocus }
}

// 	 HTML lang attribute binding 																					
/**
 * Bind the <html> lang attribute to the current i18n locale.
 * Accepts the i18n instance directly so it can be called from main.ts
 * (outside a component setup context where useI18n() would fail).
 */
export function useHtmlLang(i18nInstance: { global: { locale: string | { value: string } } }): void {
  function getLocale(): string {
    const loc = i18nInstance.global.locale
    return typeof loc === "string" ? loc : loc.value
  }

  function updateLang() {
    const locale = getLocale()
    // Map locale codes to proper HTML lang attributes
    const langMap: Record<string, string> = {
      'en': 'en',
      'de': 'de',
      'fr': 'fr',
      'en-US': 'en',
      'de-DE': 'de',
      'fr-FR': 'fr',
    }
    document.documentElement.lang = langMap[locale] || locale.split('-')[0] || 'en'
  }

  // Set on init
  updateLang()

  // Watch for locale changes
  watch(
    () => getLocale(),
    () => {
      updateLang()
    },
  )
}
