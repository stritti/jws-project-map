<template>
  <b-modal
    ref="modalRef"
    id="search-modal"
    size="lg"
    centered
    hide-footer
    title-class="w-100"
    body-class="p-0"
    :header-close-label="t('nav.close')"
    @shown="onShown"
    @hidden="onHidden"
  >
    <template #title>
      <SearchBar
        ref="searchBarRef"
        v-model="query"
        v-model:state-filter="stateFilter"
        :placeholder="t('search.placeholderShort')"
        :filter-label="t('search.filter')"
        @escape="hide()"
      />
    </template>

    <!-- Results -->
    <div class="search-results">
      <!-- Hint when query is too short -->
      <div v-if="query.trim().length < 2" class="p-4 text-center text-muted">
        <IBiSearch style="font-size: 2rem; opacity: 0.3" />
        <p class="mt-2 mb-0 small">{{ t("search.minChars") }}</p>
      </div>

      <!-- No results -->
      <div
        v-else-if="results.length === 0"
        class="p-4 text-center text-muted"
      >
        <IBiEmojiDizzy style="font-size: 2rem; opacity: 0.3" />
        <p class="mt-2 mb-0 small">{{ t("search.noResults") }} <strong>{{ query }}</strong></p>
      </div>

      <!-- Result list -->
      <b-list-group v-else flush role="listbox" id="search-results-list" :aria-label="t('search.resultsLabel')">
        <b-list-group-item
          v-for="project in results"
          :key="project.id"
          button
          role="option"
          class="result-item d-flex align-items-start gap-3 py-3 px-4"
          @click="navigate(project)"
        >
          <!-- Thumbnail -->
          <img
            v-if="getTeaserImage(project)"
            :src="getTeaserImage(project)"
            :alt="project.name"
            class="result-thumb rounded"
          />
          <div v-else class="result-thumb-placeholder rounded d-flex align-items-center justify-content-center">
            <IBiGlobe2 class="text-muted" aria-hidden="true" />
          </div>

          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold text-truncate">{{ project.name }}</div>
            <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <b-badge :variant="stateBadgeVariant(project.state)" class="text-capitalize" pill>
                {{ project.state }}
              </b-badge>
               <span v-if="project.country" class="small text-muted d-flex align-items-center gap-1">
                 <IBiGeoAlt />
                 {{ project.country.fields.Name }}
               </span>
            </div>
          </div>

          <IBiChevronRight class="text-muted align-self-center" />
        </b-list-group-item>
      </b-list-group>
    </div>

    <!-- Footer hint -->
    <div v-if="results.length > 0" class="search-footer px-4 py-2 d-flex align-items-center gap-3 text-muted small border-top">
      <span aria-hidden="true"><kbd>↵</kbd> öffnen</span>
      <span aria-hidden="true"><kbd>Esc</kbd> schließen</span>
      <span class="ms-auto" aria-live="polite">{{ results.length }} Ergebnis(se)</span>
    </div>
    <div class="sr-only" role="status" aria-live="polite">
      {{ results.length > 0 ? `${results.length} Ergebnisse gefunden` : (query.length >= 2 ? 'Keine Ergebnisse gefunden' : '') }}
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "hidden"): void;
}>();

import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Project } from "@/interfaces/Project";
import { useProjectSearch } from "@/composables/useProjectSearch";
import { useWebFrame } from "@/composables/useWebFrame";
import { useSearchStore } from "@/stores/search.store";
import SearchBar from "./SearchBar.vue";
import { useFocusRestore } from "@/composables/useAccessibility";

const router = useRouter();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const { query, stateFilter, results, reset } = useProjectSearch(projects);
const { navigateToProject } = useWebFrame();

const modalRef = ref<{ show: () => void; hide: () => void } | null>(null);
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);
const { setTrigger, restoreFocus } = useFocusRestore();

function show() {
  setTrigger();
  modalRef.value?.show();
}

function hide() {
  modalRef.value?.hide();
}

function onHidden() {
  reset();
  restoreFocus();
  emit("hidden");
}

async function onShown() {
  await nextTick();
  searchBarRef.value?.focus();
}

function navigate(project: { id: number; name: string }) {
  hide();
  navigateToProject(project);
}

function getTeaserImage(project: Project) {
  if (project.teaserImg && project.teaserImg.length > 0) {
    const img = project.teaserImg[0];
    // Use small thumbnail for the search list to save bandwidth, fallback to card_cover or original signedUrl
    return img.thumbnails?.small?.signedUrl || img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
  }
  return "/img/placeholder.png";
}

function stateBadgeVariant(state: string) {
  if (state === "finished") return "success";
  if (state === "under construction") return "warning";
  if (state === "planned") return "info";
  return "secondary";
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
    const searchStore = useSearchStore();
    searchStore.openSearch();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

defineExpose({ show, hide });
</script>

<style scoped lang="scss">
@use "@/assets/design-tokens.scss" as *;

.search-results {
  max-height: 60vh;
  overflow-y: auto;
}

.result-item {
  cursor: pointer;
  background-color: var(--color-surface);
  border-radius: var(--shape-round-default);
  margin: var(--spacing-unit) 0;
  transition: background-color 0.15s ease, transform 0.15s ease;
  
  &:hover {
    background-color: var(--color-surface-variant);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.result-thumb {
  width: calc(var(--spacing-unit) * 8); /* 32px */
  height: calc(var(--spacing-unit) * 8); /* 32px */
  object-fit: cover;
  flex-shrink: 0;
  border-radius: var(--shape-round-default);
}

.result-thumb-placeholder {
  width: calc(var(--spacing-unit) * 8); /* 32px */
  height: calc(var(--spacing-unit) * 8); /* 32px */
  flex-shrink: 0;
  background-color: var(--color-surface-variant);
  border-radius: var(--shape-round-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface-variant);
  font-size: calc(var(--font-size-body-md) * 1.2); /* ~17px */
}

.search-footer {
  background-color: var(--color-surface-variant);
  border-top: 1px solid var(--color-outline-variant);
  padding: var(--spacing-unit);
  font-size: var(--font-size-label-sm);
  color: var(--color-on-surface-variant);
  
  kbd {
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    color: var(--color-on-surface);
    font-size: var(--font-size-label-sm);
    padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit) * 0.5);
    border-radius: var(--shape-round-default);
    font-family: var(--font-family-inter);
  }
}

kbd {
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
  font-size: var(--font-size-label-sm);
  padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit) * 0.5);
  border-radius: var(--shape-round-default);
  font-family: var(--font-family-inter);
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

/* Modal title styling - search header */
.b-modal .modal-title {
  width: 100%;
}

/* Hint text styling */
.b-modal .text-muted {
  color: var(--color-on-surface-variant);
}

/* Empty state styling */
.b-modal .p-4 {
  padding: var(--spacing-gutter-md) !important;
  
  .ibi-search,
  .ibi-emoji-dizzy {
    font-size: 3rem; /* 48px */
    opacity: 0.3;
    color: var(--color-on-surface-variant);
  }
  
  p {
    font-size: var(--font-size-label-md);
    color: var(--color-on-surface-variant);
    margin-top: var(--spacing-unit);
  }
}

/* Result item text styling */
.b-modal .fw-semibold {
  font-weight: var(--font-weight-headline-md);
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface);
}

.b-modal .text-truncate {
  max-width: 100%;
}

/* Badge styling override */
.b-modal .badge {
  font-size: var(--font-size-label-sm);
  font-weight: var(--font-weight-label-sm);
  letter-spacing: var(--letter-spacing-label-sm);
  padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit) * 0.5);
  border-radius: var(--shape-round-default);
}

/* Country label styling */
.b-modal .small {
  font-size: var(--font-size-label-sm);
  color: var(--color-on-surface-variant);
  
  .ibi-geo-alt {
    font-size: 1rem; /* 16px */
    color: var(--color-on-surface-variant);
    margin-right: calc(var(--spacing-unit) * 0.5);
  }
}

/* Chevron styling */
.b-modal .ibi-chevron-right {
  font-size: 1.25rem; /* 20px */
  color: var(--color-on-surface-variant);
  opacity: 0.7;
}

/* Modal backdrop customization */
.b-modal::backdrop {
  background-color: rgba(0, 0, 0, 0.4);
}

/* Modal dialog styling */
.b-modal .modal-dialog {
  margin: 1.75rem auto; /* Bootstrap's default for lg modal */
  
  .modal-content {
    border: none;
    border-radius: var(--shape-round-lg);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    
    .modal-header {
      border-bottom: 1px solid var(--color-outline-variant);
      padding: var(--spacing-gutter-md);
    }
    
    .modal-body {
      padding: var(--spacing-gutter-md);
    }
    
    .modal-footer {
      border-top: 1px solid var(--color-outline-variant);
      padding: var(--spacing-gutter-md);
    }
  }
}
</style>

