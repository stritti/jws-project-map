<template>
  <div class="search-bar-container">
    <!-- Search bar with icons -->
    <div class="search-bar">
      <IBiSearch class="search-icon" aria-hidden="true" />
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        :placeholder="resolvedPlaceholder"
        :aria-label="t('a11y.searchInput')"
        autocomplete="off"
        class="search-input"
        @keydown.escape="$emit('escape')"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />

      <button 
        class="filter-btn" 
        :class="{ active: filterCount > 0 }"
        :aria-label="resolvedFilterLabel"
        :aria-expanded="filterVisible"
        @click="$emit('filter-click')"
      >
        <IBiFilterRight />
        <span class="filter-label">{{ resolvedFilterLabel }}</span>
        <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
      </button>

      <!-- View toggle: Map / List -->
      <div class="view-toggle" role="group" :aria-label="t('search.viewToggleLabel')">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'map' }"
          :aria-label="t('search.viewMap')"
          :aria-current="viewMode === 'map' ? 'true' : undefined"
          :disabled="viewMode === 'map'"
          @click="$emit('view-change', 'map')"
        >
          <IBiMap aria-hidden="true" />
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'list' }"
          :aria-label="t('search.viewList')"
          :aria-current="viewMode === 'list' ? 'true' : undefined"
          :disabled="viewMode === 'list'"
          @click="$emit('view-change', 'list')"
        >
          <IBiListUl aria-hidden="true" />
        </button>
      </div>

      <!-- More menu (language + about) - integrated from MainMenu -->
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

        <Teleport to="body">
          <Transition name="more-flyout" @after-enter="onMorePanelEnter">
            <div
              v-if="moreOpen"
              ref="morePanelRef"
              class="more-panel"
              :style="{ position: 'fixed', right: panelPosition.right, bottom: panelPosition.bottom }"
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
                  <span v-if="currentLocale === lang.code" class="more-check" aria-hidden="true">\u2713</span>
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
        </Teleport>
      </div>
    </div>
    
    <!-- Filter chips -->
    <div v-if="showFilterChips" class="filter-chips">
      <button
        v-for="state in stateOptions"
        :key="state.value"
        class="filter-chip"
        :class="{ active: stateFilter === state.value }"
        @click="onChipClick(state.value)"
      >
        {{ state.label }}
      </button>
    </div>

    <!-- About Modal -->
    <AboutModal ref="aboutModalRef" @hidden="restoreFocus" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { setLocale, type Locale } from "@/plugins/i18n";
import { useProjectStore } from "@/features/projects/stores/project.store";
import type { ProjectState } from "@/composables/useProjectSearch";

import IBiMap from "~icons/bi/map";
import IBiListUl from "~icons/bi/list-ul";
import IBiSearch from "~icons/bi/search";
import IBiFilterRight from "~icons/bi/filter-right";
import IBiThreeDots from "~icons/bi/three-dots";
import IBiInfoCircle from "~icons/bi/info-circle";
import AboutModal from "./AboutModal.vue";
import { useFocusRestore } from "@/composables/useAccessibility";

const { t, locale } = useI18n();
const route = useRoute();
const { setTrigger, restoreFocus } = useFocusRestore();

// More-menu state
const moreOpen = ref(false);
const moreMenuRef = ref<HTMLElement | null>(null);
const morePanelRef = ref<HTMLElement | null>(null);
const moreFocusIndex = ref(-1);
// Position for teleported panel (fixed positioning relative to viewport)
const panelPosition = ref({ right: '0px', bottom: '0px' });

const aboutModalRef = ref<InstanceType<typeof AboutModal> | null>(null);

function switchLocale(lang: Locale) {
  setLocale(lang);
  // Reload project data so localized fields (name, notes) are refetched
  useProjectStore().load().catch(() => {});
}

function toggleMore() {
  if (!moreOpen.value) {
    // Calculate position relative to viewport so the teleported panel appears above the trigger
    const trigger = moreMenuRef.value?.querySelector<HTMLElement>('.more-trigger');
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
    moreMenuRef.value?.querySelector<HTMLElement>('.more-trigger')?.focus();
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
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      idx = (idx + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
      break;
    case 'Home':
      e.preventDefault();
      idx = 0;
      break;
    case 'End':
      e.preventDefault();
      idx = items.length - 1;
      break;
    case 'Escape':
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
    (item) => item.classList.contains('active'),
  );
  moreFocusIndex.value = activeIdx >= 0 ? activeIdx : 0;
  items[moreFocusIndex.value]?.focus();
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMore();
}

function openAbout() {
  setTrigger();
  aboutModalRef.value?.show();
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
  document.addEventListener('click', onClickOutside);
  document.addEventListener('keydown', onGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  document.removeEventListener('keydown', onGlobalKeydown);
});

interface Props {
  modelValue?: string;
  stateFilter?: ProjectState;
  placeholder?: string;
  filterLabel?: string;
  showFilterChips?: boolean;
  filterCount?: number;
  filterVisible?: boolean;
  viewMode?: "map" | "list";
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "update:stateFilter", value: ProjectState): void;
  (e: "escape"): void;
  (e: "filter-click"): void;
  (e: "state-change", value: ProjectState): void;
  (e: "view-change", view: "map" | "list"): void;
  (e: "focus"): void;
  (e: "blur"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  stateFilter: "all",
  placeholder: "",
  filterLabel: "",
  showFilterChips: true,
  filterCount: 0,
  filterVisible: false,
  viewMode: "map",
});

const emit = defineEmits<Emits>();

const query = ref(props.modelValue);
const stateFilter = ref(props.stateFilter);

const resolvedPlaceholder = computed(() => props.placeholder || t("search.placeholder"));
const resolvedFilterLabel = computed(() => props.filterLabel || t("search.filter"));

const stateOptions = computed(() => [
  { value: "all" as ProjectState, label: t("search.chips.all") },
  { value: "planned" as ProjectState, label: t("search.chips.planned") },
  { value: "under construction" as ProjectState, label: t("search.chips.underConstruction") },
  { value: "finished" as ProjectState, label: t("search.chips.finished") },
]);

// Handle filter-chip click: update local state + emit both events (Codex #P2)
function onChipClick(value: ProjectState) {
  stateFilter.value = value;
  emit("update:stateFilter", value);
  emit("state-change", value);
}

watch(query, (newValue) => {
  emit("update:modelValue", newValue);
});

watch(stateFilter, (newValue) => {
  emit("update:stateFilter", newValue);
});

// Sync local state when parent resets modelValue via v-model (Codex #P2)
watch(() => props.modelValue, (newVal) => {
  query.value = newVal ?? "";
});

// Sync local state when parent resets stateFilter via v-model (Codex #P2)
watch(() => props.stateFilter, (newVal) => {
  stateFilter.value = newVal ?? "all";
});

// Expose methods for parent components
const inputRef = ref<HTMLInputElement | null>(null);
defineExpose({
  focus: () => {
    inputRef.value?.focus();
  },
  reset: () => {
    query.value = "";
    stateFilter.value = "all";
  },
});
</script>

<style scoped lang="postcss">
.search-bar-container {
  @apply w-full;
}

/* Search bar  Apple-style glassmorphism */
.search-bar {
  @apply flex items-center bg-white/70 backdrop-blur-xl border border-white/25 shadow-lg rounded-round-large px-[0.85rem] py-[0.6rem] gap-[0.5rem];
}

.search-icon {
  @apply text-[1.25rem] text-onSurface-variant flex-shrink-0;
}

.search-input {
  @apply bg-transparent border-none px-[0.5rem] py-[0.25rem] text-body-md text-onSurface placeholder:text-onSurface-variant focus:outline-2 focus:outline-secondary focus:outline-offset-2;
  /* Fill available space, but allow shrinking if needed */
  flex: 1 1 auto;
  min-width: 120px;
  transition: min-width 0.25s ease;
}

.search-bar:focus-within .search-input {
  /* Slightly expand on focus */
  min-width: 160px;
}

/* iOS Safari auto-zooms any input with font-size < 16px; force 16px on mobile */
@media (max-width: 767.98px) {
  .search-input {
    font-size: 1rem;
    line-height: 1.5;
  }
}

/* View toggle  segmented control style */
.view-toggle {
  @apply flex gap-px bg-black/10 rounded-lg p-px flex-shrink-0;
}

.view-btn {
  @apply flex items-center justify-center w-[30px] h-[30px] border-none rounded-lg bg-transparent text-onSurface-variant cursor-pointer transition-colors duration-150 text-base leading-none;
}

/* Touch-friendly minimum 44\u00d744 px on mobile */
@media (max-width: 767.98px) {
  .view-btn {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
  }
}

.view-btn:hover {
  @apply text-secondary bg-secondary/10;
}

.view-btn.active {
  @apply text-white bg-secondary shadow-[0_1px_4px_rgba(60,93,157,0.3)];
}

.view-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Filter button */
.filter-btn {
  @apply flex items-center gap-[0.25rem] bg-transparent border-none rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-onSurface cursor-pointer text-body-md relative flex-shrink-0 hover:bg-surface-variant;
}

/* Touch-friendly minimum on mobile (same as .view-btn) */
@media (max-width: 767.98px) {
  .filter-btn {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  /* Hide filter label text on mobile to save space */
  .filter-label {
    display: none;
  }
}

.filter-btn.active {
  @apply bg-secondary text-white;
}

.filter-btn .ibi-filter-right {
  @apply text-[1.25rem];
}

.filter-label {
  @apply text-label-md md:block;
}

.filter-badge {
  @apply absolute -top-1 -right-1 bg-secondary text-white text-[0.625rem] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1;
}

.filter-btn.active .filter-badge {
  @apply bg-secondary text-secondary;
}

/* Filter chips */
.filter-chips {
  @apply flex gap-[0.5rem] py-[0.75rem] overflow-x-auto touch-pan-x scrollbar-hide;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  @apply flex-shrink-0 px-[0.75rem] py-[0.375rem] rounded-full text-label-md font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap bg-surface border border-outline text-onSurface hover:bg-surface-variant;
}

.filter-chip.active {
  @apply bg-secondary border-secondary text-white;
}

/* More menu styles */
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

/* Responsive adjustments for mobile */
@media (max-width: 767.98px) {
  .search-bar {
    gap: 0.25rem;
  }
  
  .search-input {
    /* On mobile, fill available space but allow shrinking */
    flex: 1 1 auto;
    min-width: 80px;
  }
  
  .search-bar:focus-within .search-input {
    /* Slightly expand on focus */
    min-width: 100px;
  }
  
  /* On mobile, keep view toggle visible at all times */
  .view-toggle {
    flex-shrink: 0;
  }
  
  /* On mobile, also hide filter label to save space */
  .search-bar:focus-within .filter-label {
    display: none;
  }
  
  .more-trigger {
    width: 36px;
    height: 36px;
  }
  
  :deep(.more-trigger svg) {
    font-size: 1.25rem;
  }
}
</style>
