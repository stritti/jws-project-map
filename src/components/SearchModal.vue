<template>
  <b-modal
    ref="modalRef"
    id="search-modal"
    size="lg"
    centered
    hide-footer
    title-class="w-100"
    body-class="p-0"
    @shown="onShown"
    @hidden="reset()"
  >
    <template #title>
      <div class="d-flex align-items-center gap-2 w-100" role="combobox" aria-haspopup="listbox" :aria-expanded="results.length > 0" aria-owns="search-results-list">
        <IBiSearch class="text-muted" style="font-size: 1.2rem; flex-shrink: 0" aria-hidden="true" />
        <b-form-input
          ref="inputRef"
          v-model="query"
          type="search"
          placeholder="Projekte suchen…"
          aria-label="Projekte suchen"
          autocomplete="off"
          class="search-input border-0 shadow-none fs-5"
          @keydown.escape="hide()"
        />
        <kbd class="d-none d-md-inline text-muted shortcut-badge" aria-hidden="true">Esc</kbd>
      </div>
    </template>

    <!-- Results -->
    <div class="search-results">
      <!-- Hint when query is too short -->
      <div v-if="query.trim().length < 2" class="p-4 text-center text-muted">
        <IBiSearch style="font-size: 2rem; opacity: 0.3" />
        <p class="mt-2 mb-0 small">Mindestens 2 Zeichen eingeben</p>
      </div>

      <!-- No results -->
      <div
        v-else-if="results.length === 0"
        class="p-4 text-center text-muted"
      >
        <IBiEmojiDizzy style="font-size: 2rem; opacity: 0.3" />
        <p class="mt-2 mb-0 small">Keine Projekte gefunden für <strong>{{ query }}</strong></p>
      </div>

      <!-- Result list -->
      <b-list-group v-else flush role="listbox" id="search-results-list" aria-label="Suchergebnisse">
        <b-list-group-item
          v-for="project in results"
          :key="project.id"
          button
          role="option"
          class="result-item d-flex align-items-start gap-3 py-3 px-4"
          @click="navigate(project.id)"
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
                {{ project.country.Name }}
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
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Project } from "@/interfaces/Project";
import { useProjectSearch } from "@/composables/useProjectSearch";

const router = useRouter();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const { query, results, reset } = useProjectSearch(projects);

const modalRef = ref<{ show: () => void; hide: () => void } | null>(null);
const inputRef = ref<{ $el: HTMLInputElement } | null>(null);

function show() {
  modalRef.value?.show();
}

function hide() {
  modalRef.value?.hide();
}

async function onShown() {
  await nextTick();
  // Try focusing the element directly if possible, or fall back to $el
  const el = inputRef.value?.$el as HTMLInputElement | undefined;
  if (el) {
    el.focus();
    // Some browsers need a double-tap if the transition is still active
    setTimeout(() => el.focus(), 50);
  }
}

function navigate(id: number) {
  hide();
  router.push(`/project/${id}`);
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
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    show();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

defineExpose({ show, hide });
</script>

<style scoped lang="scss">
.search-input {
  background: transparent;
  &:focus {
    box-shadow: none;
  }
}

.search-results {
  max-height: 60vh;
  overflow-y: auto;
}

.result-item {
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bs-light);
  }
}

.result-thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  flex-shrink: 0;
}

.result-thumb-placeholder {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  background-color: var(--bs-gray-200);
  font-size: 1.4rem;
}

.search-footer {
  background-color: var(--bs-gray-100);
}

.shortcut-badge {
  font-size: 0.7rem;
  background: var(--bs-gray-200);
  border: 1px solid var(--bs-gray-400);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
}

kbd {
  font-size: 0.7rem;
  background: var(--bs-gray-200);
  border: 1px solid var(--bs-gray-400);
  border-radius: 4px;
  padding: 1px 5px;
  color: inherit;
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
