<template>
  <div
  v-if="isVisible"
  class="modal-overlay"
  @click.self="hide"
  @keydown.escape="hide"
  @keydown.tab="trapFocus"
>
    <div 
      class="modal-content rounded-round-xl border-0 shadow-lg bg-white max-w-lg mx-4 my-8" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="search-modal-title"
      aria-describedby="search-modal-desc"
    >
      <div class="modal-header border-0 pb-0 flex items-center justify-between p-4">
        <h2 id="search-modal-title" class="sr-only">{{ t('search.resultsLabel') }}</h2>
        <p id="search-modal-desc" class="sr-only">{{ t('a11y.searchInput') }}</p>
        <MainMenu
          ref="searchBarRef"
          v-model="query"
          v-model:state-filter="stateFilter"
          :placeholder="t('search.placeholderShort')"
          :filter-label="t('search.filter')"
          @escape="hide()"
        />
        <button 
          class="close-btn" 
          @click="hide" 
          :aria-label="t('a11y.closeSearch')"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <!-- Results -->
      <div class="search-results" role="region" :aria-label="t('a11y.searchResultsLabel')">
        <!-- Hint when query is too short -->
        <div v-if="query.trim().length < 2" class="p-4 text-center text-onSurface-variant" role="status">
          <IBiSearch style="font-size: 2rem; opacity: 0.3" aria-hidden="true" />
          <p class="mt-2 mb-0 text-label-sm">{{ t("search.minChars") }}</p>
        </div>

        <!-- No results -->
        <div
          v-else-if="results.length === 0"
          class="p-4 text-center text-onSurface-variant"
          role="status"
          aria-live="polite"
        >
          <IBiEmojiDizzy style="font-size: 2rem; opacity: 0.3" aria-hidden="true" />
          <p class="mt-2 mb-0 text-label-sm">{{ t("search.noResults") }} <strong>{{ query }}</strong></p>
        </div>

        <!-- Result list -->
        <div 
          v-else 
          class="result-list" 
          role="listbox" 
          id="search-results-list" 
          :aria-label="t('a11y.searchResultsLabel')"
        >
          <project-search-result
            v-for="(project, index) in results"
            :key="project.id"
            :project="project"
            :tabindex="index === 0 ? 0 : -1"
            @select="navigate"
          />
        </div>
      </div>

      <!-- Footer hint -->
      <div v-if="results.length > 0" class="search-footer px-4 py-2 flex items-center gap-3 text-onSurface-variant text-label-sm border-t border-outline-variant">
        <span aria-hidden="true"><kbd>↑</kbd> <kbd>↓</kbd> {{ t('a11y.navigate') }}</span>
        <span aria-hidden="true"><kbd>Enter</kbd> {{ t('a11y.open') }}</span>
        <span aria-hidden="true"><kbd>Esc</kbd> {{ t('a11y.close') }}</span>
        <span class="ml-auto" aria-live="polite">{{ t("a11y.searchResultsAnnouncement", { count: results.length }) }}</span>
      </div>
      <div class="sr-only" role="status" aria-live="polite">
        {{ results.length > 0 ? t("a11y.searchResultsAnnouncement", { count: results.length }) : (query.length >= 2 ? t("a11y.noResultsAnnouncement") : '') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useSearchStore } from "@/stores/search.store";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "hidden"): void;
}>();

import { useProjectStore } from "@/features/projects/stores/project.store";
import { useProjectSearch } from "@/composables/useProjectSearch";
import { useWebFrame } from "@/composables/useWebFrame";
import MainMenu from "./MainMenu.vue";
import ProjectSearchResult from "@/components/project/ProjectSearchResult.vue";
import { useFocusRestore } from "@/composables/useAccessibility";
import { useScrollLock } from "@/composables/useScrollLock";

const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const { query, stateFilter, results, reset } = useProjectSearch(projects);
const { navigateToProject } = useWebFrame();

const isVisible = ref(false);
const searchBarRef = ref<InstanceType<typeof MainMenu> | null>(null);
const { setTrigger, restoreFocus } = useFocusRestore();
// Shares the document lock with the gallery instead of writing
// `body.overflow` directly: a second writer cleared the gallery's lock when
// the search closed while the gallery was still open.
const { lock: lockScroll, unlock: unlockScroll } = useScrollLock();

function show() {
  setTrigger();
  isVisible.value = true;
  lockScroll();
  nextTick(() => {
    searchBarRef.value?.focus();
  });
}

function hide() {
  isVisible.value = false;
  unlockScroll();
  reset();
  restoreFocus();
  emit("hidden");
}

function navigate(project: { id: number; name: string }) {
  hide();
  navigateToProject(project);
}

// Ctrl+K / Cmd+K keyboard shortcut
function handleKeydown(e: KeyboardEvent) {
  // Don't open if user is currently typing in another input
  if (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  ) {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    useSearchStore().openSearch();
  }
}

// Trap focus inside modal
function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !isVisible.value) return;

  const modal = e.currentTarget as HTMLElement;
  const focusable = modal.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
// Never leave the document locked when the modal is torn down while open.
onBeforeUnmount(unlockScroll);

defineExpose({ show, hide });
</script>

<style lang="postcss" scoped>
@reference "../assets/main.css";

.search-results {
  @apply max-h-[60vh] overflow-y-auto;
}

.result-list {
  @apply divide-y divide-outline-variant;
}

.search-footer {
  @apply bg-surface-variant border-t border-outline-variant px-[var(--spacing-unit)] py-[var(--spacing-unit)] text-label-sm text-onSurface-variant;

  kbd {
    @apply bg-surface border border-outline text-onSurface text-label-sm px-[calc(var(--spacing-unit)*0.25)] py-[calc(var(--spacing-unit)*0.5)] rounded-round-default;
  }
}

kbd {
  @apply bg-surface border border-outline text-onSurface text-label-sm px-[calc(var(--spacing-unit)*0.25)] py-[calc(var(--spacing-unit)*0.5)] rounded-round-default;
}

.modal-overlay {
  @apply fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4;
}

.modal-content {
  @apply w-full max-w-lg mx-4 my-8;
}

.modal-header {
  @apply border-0 pb-0 flex items-center justify-between p-4;
}

.close-btn {
  @apply w-8 h-8 rounded-full border-none bg-transparent text-onSurface flex items-center justify-center text-[22px] cursor-pointer leading-none transition-all duration-200 hover:bg-black/10 focus:outline-2 focus:outline-secondary focus:outline-offset-2;
}

.close-btn:focus-visible {
  @apply outline-2 outline-secondary outline-offset-2;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
