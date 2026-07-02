<template>
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

    <Teleport to="body" :disabled="!teleport">
      <Transition name="more-flyout" @after-enter="onMorePanelEnter">
        <div
          v-if="moreOpen"
          ref="morePanelRef"
          class="more-panel"
          :class="{ teleported }"
          :style="panelInlineStyle"
          role="menu"
          :aria-label="t('nav.more')"
          @keydown="onMorePanelKeydown"
        >
          <!-- Language options -->
          <div class="more-section">
            <button
              v-for="lang in languages"
              :key="lang.code"
              class="more-option"
              :class="{ active: currentLocale === lang.code }"
              role="menuitem"
              :lang="lang.code"
              :aria-current="currentLocale === lang.code ? 'true' : undefined"
              @click="switchLocale(lang.code); closeMore()"
            >
              <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
              <span>{{ lang.label }}</span>
              <span v-if="currentLocale === lang.code" class="more-check" aria-hidden="true">✓</span>
            </button>
          </div>

          <div class="more-divider" role="separator"></div>

          <!-- About -->
          <button
            class="more-option"
            role="menuitem"
            @click="$emit('about'); closeMore()"
          >
            <IBiInfoCircle aria-hidden="true" />
            <span>{{ t('nav.about') }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale, type Locale } from "@/plugins/i18n";
import { useProjectStore } from "@/features/projects/stores/project.store";

import IBiThreeDots from "~icons/bi/three-dots";
import IBiInfoCircle from "~icons/bi/info-circle";

defineEmits<{
  (e: "about"): void;
}>();

const props = withDefaults(defineProps<{
  teleport?: boolean;
}>(), {
  teleport: false,
});

const { t, locale } = useI18n();

// More-menu state
const moreOpen = ref(false);
const moreMenuRef = ref<HTMLElement | null>(null);
const morePanelRef = ref<HTMLElement | null>(null);
const moreFocusIndex = ref(-1);

// Teleport-enabled: fixed position relative to viewport
const panelPosition = ref({ right: "0px", bottom: "0px" });
const teleported = computed(() => props.teleport && moreOpen.value);

const panelInlineStyle = computed(() => {
  if (!teleported.value) return {};
  return {
    position: "fixed" as const,
    right: panelPosition.value.right,
    bottom: panelPosition.value.bottom,
  };
});

function switchLocale(lang: Locale) {
  setLocale(lang);
  // Reload project data so localized fields (name, notes) are refetched
  useProjectStore().load().catch(() => {});
}

function toggleMore() {
  if (!moreOpen.value && props.teleport) {
    // Calculate position relative to viewport for teleported panel
    const trigger = moreMenuRef.value?.querySelector<HTMLElement>(".more-trigger");
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      panelPosition.value = {
        right: `${window.innerWidth - rect.right}px`,
        bottom: `${window.innerHeight - rect.top + 8}px`,
      };
    }
  }
  moreOpen.value = !moreOpen.value;
}

function closeMore() {
  moreOpen.value = false;
  moreFocusIndex.value = -1;
  // Return focus to trigger after DOM update
  nextTick(() => {
    moreMenuRef.value?.querySelector<HTMLElement>(".more-trigger")?.focus();
  });
}

function onClickOutside(e: MouseEvent) {
  if (
    moreOpen.value &&
    moreMenuRef.value &&
    !moreMenuRef.value.contains(e.target as Node) &&
    !morePanelRef.value?.contains(e.target as Node)
  ) {
    closeMore();
  }
}

/* Keyboard navigation for role="menu" (ARIA APG pattern) */
function onMorePanelKeydown(e: KeyboardEvent) {
  if (!moreOpen.value) return;
  const items = morePanelRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]');
  if (!items || items.length === 0) return;

  let idx = moreFocusIndex.value;

  switch (e.key) {
    case "ArrowDown":
    case "ArrowRight":
      e.preventDefault();
      idx = (idx + 1) % items.length;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
      break;
    case "Home":
      e.preventDefault();
      idx = 0;
      break;
    case "End":
      e.preventDefault();
      idx = items.length - 1;
      break;
    case "Escape":
      e.preventDefault();
      closeMore();
      return;
    default:
      return;
  }

  moreFocusIndex.value = idx;
  items[idx]?.focus();
}

function onMorePanelEnter() {
  const items = morePanelRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]');
  if (!items || items.length === 0) return;
  const activeIdx = Array.from(items).findIndex(
    (item) => item.classList.contains("active"),
  );
  moreFocusIndex.value = activeIdx >= 0 ? activeIdx : 0;
  items[moreFocusIndex.value]?.focus();
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeMore();
}

// Current locale for language switching
const currentLocale = computed(() => locale.value);

const languages: { code: Locale; flag: string; label: string }[] = [
  { code: "de", flag: "de", label: "Deutsch" },
  { code: "en", flag: "gb", label: "English" },
  { code: "fr", flag: "fr", label: "Fran\u00e7ais" },
];

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onGlobalKeydown);
});
</script>

<style scoped lang="postcss">
.more-menu {
  @apply relative flex items-center flex-shrink-0;
}

.more-trigger {
  @apply flex items-center justify-center w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border-none bg-transparent cursor-pointer p-0 transition-colors duration-200 text-onSurface-variant;

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

/* Non-teleported: positioned relative to .more-menu parent */
.more-panel:not(.teleported) {
  @apply absolute bottom-[calc(100%+8px)] right-0;
}

.more-panel {
  @apply z-50 min-w-[180px] p-2 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] origin-bottom-right;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.more-option {
  @apply flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-sm text-onSurface transition-colors duration-150 text-left;

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

.more-section {
  @apply flex flex-col gap-1;
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

/* Touch-friendly trigger on mobile */
@media (max-width: 767.98px) {
  .more-trigger {
    width: 36px;
    height: 36px;
  }

  :deep(.more-trigger svg) {
    font-size: 1.25rem;
  }
}
</style>
