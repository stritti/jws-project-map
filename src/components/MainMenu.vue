<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { i18n, setLocale, type Locale } from "@/plugins/i18n";
import { useProjectStore } from "@/features/projects/stores/project.store";

const { t } = useI18n();
import IBiMap from "~icons/bi/map";
import IBiMapFill from "~icons/bi/map-fill";
import IBiListUl from "~icons/bi/list-ul";
import IBiListCheck from "~icons/bi/list-check";
import IBiInfoCircle from "~icons/bi/info-circle";
import AboutModal from "./AboutModal.vue";

const route = useRoute();
const currentLocale = computed(() => i18n.global.locale as unknown as string);

function switchLocale(locale: Locale) {
  setLocale(locale);
  // Reload project data so localized fields (name, notes) are refetched (Codex #P2)
  useProjectStore().load(false).catch(() => {});
}

const aboutModalRef = ref<InstanceType<typeof AboutModal> | null>(null);

const languages: { code: Locale; flag: string; label: string }[] = [
  { code: "de", flag: "de", label: "Deutsch" },
  { code: "en", flag: "gb", label: "English" },
  { code: "fr", flag: "fr", label: "Français" },
];

interface NavItem {
  to: string;
  iconInactive: unknown;
  iconActive: unknown;
  label: string;
  exact?: boolean;
}

const navItems = computed<NavItem[]>(() => [
  { to: "/", iconInactive: IBiMap, iconActive: IBiMapFill, label: t("nav.map"), exact: true },
  { to: "/project", iconInactive: IBiListUl, iconActive: IBiListCheck, label: t("nav.list") },
]);

function isActive(item: NavItem): boolean {
  if (item.exact) return route.path === item.to;
  return route.path.startsWith(item.to);
}
</script>

<template>
  <nav
    class="main-menu"
    aria-label="Main navigation"
  >
    <!-- Navigation items -->
    <div class="nav-items">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item) }"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <component :is="isActive(item) ? item.iconActive : item.iconInactive" class="nav-icon" aria-hidden="true" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </div>

    <!-- About button -->
    <button
      class="about-btn"
      :aria-label="t('nav.about')"
      :title="t('nav.about')"
      @click="aboutModalRef?.show()"
    >
      <IBiInfoCircle aria-hidden="true" />
    </button>

    <AboutModal ref="aboutModalRef" />

    <!-- Language switcher -->
    <div class="lang-section" role="group" aria-label="Language selector">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="lang-btn"
        :class="{ active: currentLocale === lang.code }"
        :lang="lang.code"
        :aria-label="lang.label"
        :aria-current="currentLocale === lang.code ? 'true' : undefined"
        @click="switchLocale(lang.code)"
      >
        <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.main-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom, 0px)) 0.75rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);

  // Thin top border for definition on light backgrounds
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 1rem;
    right: 1rem;
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
  }
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--color-on-surface-variant, #45474c);
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
  min-width: 64px;

  &:hover {
    color: var(--color-primary, #3d5e9e);
    background: rgba(60, 93, 157, 0.06);
  }

  &.active {
    color: var(--color-secondary, #3d5e9e);
    background: rgba(60, 93, 157, 0.12);
    font-weight: 700;

    .nav-label {
      font-weight: 700;
    }
  }
}

.nav-icon {
  font-size: 1.35rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

/* About button */
.about-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  color: var(--color-on-surface-variant, #45474c);

  &:hover {
    color: var(--color-primary, #3d5e9e);
    background: rgba(60, 93, 157, 0.08);
  }

  :deep(svg) {
    font-size: 1.25rem;
  }
}

/* Language switcher */
.lang-section {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  opacity: 0.4;
  filter: grayscale(0.6);

  &:hover {
    opacity: 0.85;
    filter: grayscale(0);
    background: rgba(60, 93, 157, 0.1);
  }

  &.active {
    opacity: 1;
    filter: grayscale(0);
    background: rgba(60, 93, 157, 0.1);
  }

  :deep(.fi) {
    font-size: 0.95rem;
    border-radius: 2px;
  }
}
</style>
