<template>
  <div class="search-bar-container">
    <!-- Search bar with icons -->
    <div class="search-bar">
      <IBiSearch class="search-icon" aria-hidden="true" />
      <b-form-input
        ref="inputRef"
        v-model="query"
        type="search"
        :placeholder="resolvedPlaceholder"
        :aria-label="resolvedPlaceholder"
        autocomplete="off"
        class="search-input"
        @keydown.escape="$emit('escape')"
      />

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ProjectState } from "@/composables/useProjectSearch";

import IBiMap from "~icons/bi/map";
import IBiListUl from "~icons/bi/list-ul";

const { t } = useI18n();

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

<style scoped lang="scss">
@use "@/assets/design-tokens.scss" as *;

.search-bar-container {
  width: 100%;
}

// Search bar — Apple-style glassmorphism
.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  padding: 0.6rem 0.85rem;
  gap: 0.5rem;
}

.search-icon {
  font-size: 1.25rem;
  color: var(--color-on-surface-variant);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-body-md);
  // iOS Safari auto-zooms any input with font-size < 16px; force 16px on mobile
  @media (max-width: 767.98px) {
    font-size: 1rem;
  }
  color: var(--color-on-surface);
  
  &:focus {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
    box-shadow: none;
  }
  
  &::placeholder {
    color: var(--color-on-surface-variant);
  }
}

// View toggle — segmented control style
.view-toggle {
  display: flex;
  gap: 1px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 2px;
  flex-shrink: 0;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-on-surface-variant, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
  line-height: 1;

  &:hover {
    color: var(--color-secondary, #3d5e9e);
    background: rgba(60, 93, 157, 0.06);
  }

  &.active {
    color: #fff;
    background: var(--color-secondary, #3d5e9e);
    box-shadow: 0 1px 4px rgba(60, 93, 157, 0.3);
  }
}

// Filter button
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: var(--color-on-surface);
  cursor: pointer;
  font-size: var(--font-size-body-md);
  position: relative;
  flex-shrink: 0;
  
  &:hover {
    background: var(--color-surface-variant);
  }
  
  &.active {
    background: var(--color-secondary);
    color: var(--color-on-secondary);
  }
  
  .ibi-filter-right {
    font-size: 1.25rem;
  }
  
  .filter-label {
    font-size: var(--font-size-label-md);
  }
  
  .filter-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--color-secondary);
    color: var(--color-on-secondary);
    font-size: 0.625rem;
    font-weight: 600;
    min-width: 16px;
    height: 16px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
  
  &.active .filter-badge {
    background: var(--color-on-secondary);
    color: var(--color-secondary);
  }
}

// Filter chips
.filter-chips {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-chip {
  flex-shrink: 0;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: var(--font-size-label-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  
  // Unselected state - neutral with 1px border
  background: var(--color-surface);
  border: 1px solid var(--color-outline);
  color: var(--color-on-surface);
  
  &:hover {
    background: var(--color-surface-variant);
  }
  
  // Selected state - secondary color
  &.active {
    background: var(--color-secondary);
    border-color: var(--color-secondary);
    color: var(--color-on-secondary);
  }
}
</style>
