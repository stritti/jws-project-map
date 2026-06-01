import { ref, watch } from "vue"
import type { Router, RouteLocationNormalizedLoaded } from "vue-router"
import { useI18n } from "vue-i18n"
import { useProjectStore } from "@/features/projects/stores/project.store"
import { parseProjectId } from "@/utils/slug"

// ── Singleton live region for screen reader announcements ──────────────
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

// ── Focus restore helper ───────────────────────────────────────────────
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
      triggerElement.value.focus()
    }
    triggerElement.value = null
  }

  return { triggerElement, setTrigger, restoreFocus }
}

// ── Page title updater ─────────────────────────────────────────────────
/**
 * Update document.title on route changes.
 * Must be called from within a component setup (uses useI18n).
 */
export function usePageTitle(router: Router): void {
  const { t } = useI18n()
  const projectStore = useProjectStore()

  function updateTitle(route: RouteLocationNormalizedLoaded) {
    const projectId = route.params.projectId
    if (projectId) {
      const id = parseProjectId(String(projectId))
      const project = projectStore.projects.find((p) => p.id === id)
      const name = project?.name ?? String(projectId)
      document.title = `${name} — JWS Project Map`
    } else {
      // Map route titles by path
      const path = route.path
      let viewName: string
      if (path === "/" || path === "") {
        viewName = t("nav.map")
      } else if (path.startsWith("/project")) {
        viewName = t("nav.list")
      } else {
        viewName = "JWS Project Map"
      }
      document.title = `${viewName} — JWS Project Map`
    }
  }

  // Set title on init
  updateTitle(router.currentRoute.value)

  // Update on every route change
  router.afterEach((to) => {
    updateTitle(to)
  })
}

// ── HTML lang attribute binding ────────────────────────────────────────
/**
 * Bind the <html> lang attribute to the current i18n locale.
 * Accepts the i18n instance directly so it can be called from main.ts
 * (outside a component setup context where useI18n() would fail).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useHtmlLang(i18nInstance: any): void {
  function getLocale(): string {
    const loc = i18nInstance.global.locale
    return typeof loc === "string" ? loc : loc.value
  }

  function updateLang() {
    document.documentElement.lang = getLocale()
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
