<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale, type Locale } from "@/plugins/i18n";
import { useProjectStore } from "@/features/projects/stores/project.store";

const { t, locale } = useI18n();
import IBiMap from "~icons/bi/map";
import IBiMapFill from "~icons/bi/map-fill";
import IBiListUl from "~icons/bi/list-ul";
import IBiListCheck from "~icons/bi/list-check";
import IBiInfoCircle from "~icons/bi/info-circle";
import AboutModal from "./AboutModal.vue";
import { useFocusRestore } from "@/composables/useAccessibility";

const route = useRoute();

function switchLocale(lang: Locale) {
  setLocale(lang);
  // Reload project data so localized fields (name, notes) are refetched (Codex #P2)
  useProjectStore().load().catch(() => {});
}

const aboutModalRef = ref<InstanceType<typeof AboutModal> | null>(null);
const { setTrigger, restoreFocus } = useFocusRestore();

function openAbout() {
  setTrigger();
  aboutModalRef.value?.show();
}


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
    role="navigation"
    :aria-label="t('a11y.mainNavigation')"
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
      @click="openAbout"
    >
      <IBiInfoCircle aria-hidden="true" />
    </button>

    <AboutModal ref="aboutModalRef" @hidden="restoreFocus" />

    <!-- Language switcher -->
    <div class="lang-section" role="group" :aria-label="t('a11y.languageSelector')">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="lang-btn"
        :class="{ active: locale === lang.code }"
        :lang="lang.code"
        :aria-label="lang.label"
        :aria-current="locale === lang.code ? 'true' : undefined"
        @click="switchLocale(lang.code)"
      >
        <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
.main-menu {
  @apply fixed bottom-0 left-0 right-0 z-[999] flex items-center justify-evenly px-[0.5rem] md:px-[0.75rem] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-[0.5rem] bg-white/95 backdrop-blur-xl rounded-t-[1rem] shadow-[0_-4px_16px_rgba(0,0,0,0.06)];

  /* Thin top border for definition on light backgrounds */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 1rem;
    right: 1rem;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.nav-items {
  @apply flex items-center gap-[0.15rem] md:gap-[0.25rem];
}

.nav-item {
  @apply flex flex-col items-center justify-center gap-[2px] md:gap-[3px] no-underline text-onSurface-variant px-[0.25rem] md:px-[0.375rem] py-[0.25rem] md:py-[0.375rem] rounded-full transition-all duration-200 min-w-[40px] md:min-w-[64px];

  &:hover {
    @apply text-primary bg-secondary/10;
  }

  &.active {
    @apply text-secondary bg-secondary/12 font-bold;

    .nav-label {
      @apply font-bold;
    }
  }
}

.nav-icon {
  @apply text-[1.25rem] md:text-[1.35rem] leading-none transition-all duration-200;
}

.nav-label {
  @apply hidden md:block text-[0.7rem] font-medium leading-none tracking-[0.02em] transition-all duration-200;
}

/* About button */
.about-btn {
  @apply flex items-center justify-center w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border-none bg-transparent cursor-pointer p-0 transition-all duration-200 text-onSurface-variant;

  &:hover {
    @apply text-primary bg-secondary/10;
  }

  :deep(svg) {
    font-size: 1.15rem;
  }
}

/* Language switcher */
.lang-section {
  @apply flex items-center gap-[0.1rem] md:gap-[0.15rem];
}

.lang-btn {
  @apply flex items-center justify-center w-[22px] h-[22px] md:w-[28px] md:h-[28px] rounded-full border-2 border-transparent bg-transparent cursor-pointer p-0 transition-all duration-200 opacity-40 grayscale-[0.6];

  &:hover {
    @apply opacity-85 grayscale-0 bg-secondary/10;
  }

  &.active {
    @apply opacity-100 grayscale-0 bg-secondary shadow-[0_0_0_2px_#fff];
  }

  :deep(.fi) {
    font-size: 0.75rem;
    border-radius: 2px;
  }
}

/* On mobile, reduce overall spacing */
@media (max-width: 767.98px) {
  .nav-item {
    min-width: 36px;
  }
}
</style>
