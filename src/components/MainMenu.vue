<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
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
import IBiThreeDots from "~icons/bi/three-dots";
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

/* More-menu state */
const moreOpen = ref(false);
const moreMenuRef = ref<HTMLElement | null>(null);

function toggleMore() {
  moreOpen.value = !moreOpen.value;
}

function closeMore() {
  moreOpen.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (moreOpen.value && moreMenuRef.value && !moreMenuRef.value.contains(e.target as Node)) {
    closeMore();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMore();
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  document.removeEventListener('keydown', onKeydown);
});

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

    <!-- Right-section: More menu (language + about) -->
    <div class="right-section">
      <div ref="moreMenuRef" class="more-menu" :class="{ open: moreOpen }">
        <button
          class="more-trigger"
          :aria-label="t('nav.more')"
          :title="t('nav.more')"
          :aria-expanded="moreOpen"
          :aria-haspopup="true"
          @click="toggleMore"
        >
          <IBiThreeDots aria-hidden="true" />
        </button>

        <Transition name="more-flyout">
          <div v-if="moreOpen" class="more-panel" role="menu" :aria-label="t('nav.more')">
            <!-- Language options -->
            <div class="more-section">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="more-option"
                :class="{ active: locale === lang.code }"
                role="menuitem"
                :lang="lang.code"
                :aria-label="lang.label"
                @click="switchLocale(lang.code); closeMore()"
              >
                <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
                <span>{{ lang.label }}</span>
                <span v-if="locale === lang.code" class="more-check" aria-hidden="true">✓</span>
              </button>
            </div>

            <div class="more-divider" role="separator"></div>

            <!-- About -->
            <button
              class="more-option"
              role="menuitem"
              @click="openAbout(); closeMore()"
            >
              <IBiInfoCircle aria-hidden="true" />
              <span>{{ t('nav.about') }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <AboutModal ref="aboutModalRef" @hidden="restoreFocus" />
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
.main-menu {
  @apply fixed bottom-0 left-0 right-0 z-[999] flex items-center justify-start px-[0.5rem] md:px-[0.75rem] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-[0.5rem] bg-white/95 backdrop-blur-xl rounded-t-[1rem] shadow-[0_-4px_16px_rgba(0,0,0,0.06)];

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

/* Right section — pushed to the right */
.right-section {
  @apply flex items-center gap-[0.25rem] ml-auto;
}

/* More menu */
.more-menu {
  @apply relative flex items-center;
}

.more-trigger {
  @apply flex items-center justify-center w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border-none bg-transparent cursor-pointer p-0 transition-all duration-200 text-onSurface-variant;

  &:hover {
    @apply text-primary bg-secondary/10;
  }

  :deep(svg) {
    font-size: 1.15rem;
  }
}

.more-menu.open .more-trigger {
  @apply text-primary bg-secondary/15;
}

.more-panel {
  @apply absolute bottom-[calc(100%+8px)] right-0 z-50 min-w-[180px] p-2 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] origin-bottom-right;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.more-option {
  @apply flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-sm text-onSurface transition-all duration-150 text-left;

  &:hover {
    @apply bg-secondary/10 text-primary;
  }

  &.active {
    @apply text-primary bg-secondary/12 font-medium;
  }

  :deep(.fi) {
    font-size: 0.85rem;
    border-radius: 2px;
  }

  :deep(svg) {
    font-size: 1.1rem;
  }
}

.more-check {
  @apply ml-auto text-primary text-xs;
}

.more-divider {
  @apply h-[1px] mx-2 my-1;
  background: rgba(0, 0, 0, 0.06);
}

/* Flyout transition */
.more-flyout-enter-active {
  transition: opacity 0.12s ease-out, transform 0.12s ease-out;
}

.more-flyout-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.more-flyout-enter-from,
.more-flyout-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.97);
}

/* On mobile, reduce overall spacing */
@media (max-width: 767.98px) {
  .nav-item {
    min-width: 36px;
  }
}
</style>
