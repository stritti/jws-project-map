<template>
  <div class="filter-dropdown" role="complementary" :aria-label="t('a11y.filterPanel')">
    <div class="filter-card">
      <!-- Header -->
      <div class="filter-header">
        <h3 class="filter-title">
          <IBiFunnel /> {{ t("search.filter") }}
        </h3>
        <button class="filter-close" :aria-label="t('common.close')" @click="emit('close')">
          <IBiX />
        </button>
      </div>

      <div class="filter-scroll">
        <div class="filter-grid">
          <div class="filter-group sm:border-r sm:border-outline/20 sm:pr-3">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiCheck2Circle /> {{ t("search.filterGroups.status") }}
              </legend>
              <div class="custom-check-group">
                <label v-for="opt in stateOptions" :key="opt.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="stateFilter"
                    :value="opt.value"
                    class="form-check-input"
                  />
                  <span class="form-check-checkmark" aria-hidden="true">
                    <IBiCheck class="check-icon" />
                  </span>
                  <span class="form-check-label">{{ opt.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
          <div class="filter-group sm:border-r sm:border-outline/20 sm:pr-3">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiTag /> {{ t("search.filterGroups.categories") }}
              </legend>
              <div class="custom-check-group scrollable-group">
                <label v-for="cat in categoryList" :key="cat.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="categoryFilter"
                    :value="cat.value"
                    class="form-check-input"
                  />
                  <span class="form-check-checkmark" aria-hidden="true">
                    <IBiCheck class="check-icon" />
                  </span>
                  <span class="form-check-label">{{ cat.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
          <div class="filter-group">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiGeoAlt /> {{ t("search.filterGroups.countries") }}
              </legend>
              <div class="custom-check-group scrollable-group">
                <label v-for="c in countryList" :key="c.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="countryFilter"
                    :value="c.value"
                    class="form-check-input"
                  />
                  <span class="form-check-checkmark" aria-hidden="true">
                    <IBiCheck class="check-icon" />
                  </span>
                  <span class="form-check-label">{{ c.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFilterStore } from '@/stores/filter.store'
import { useCategoryStore } from '@/stores/category.store'
import { useCountryStore } from '@/stores/country.store'
import { storeToRefs } from 'pinia'

import IBiFunnel from "~icons/bi/funnel";
import IBiX from "~icons/bi/x";
import IBiCheck from "~icons/bi/check";

const { t } = useI18n({ useScope: 'global' })
const filterStore = useFilterStore()
const categoryStore = useCategoryStore()
const countryStore = useCountryStore()

const { categories } = storeToRefs(categoryStore)
const { countries } = storeToRefs(countryStore)
const { stateFilter, categoryFilter, countryFilter } = storeToRefs(filterStore)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const stateOptions = computed(() => [
  { text: t('project.state.finished'), value: 'finished' },
  { text: t('project.state.underConstruction'), value: 'under construction' },
  { text: t('project.state.planned'), value: 'planned' },
])

const categoryList = computed(() =>
  categories.value.map((category) => ({
    text: categoryStore.getDisplayName(category.id),
    value: Number(category.id),
    ...category,
  })),
)

const countryList = computed(() =>
  countries.value.map((country) => ({
    text: countryStore.getDisplayName(country.id),
    value: Number(country.id),
    ...country,
  })),
)
</script>

<style lang="postcss" scoped>
.filter-dropdown {
  position: relative;
}

.filter-card {
  @apply bg-white/70 backdrop-blur-xl shadow-lg border border-white/25 rounded-round-xl overflow-hidden;
}

/* ── Header ── */
.filter-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-outline/15;
}

.filter-title {
  @apply flex items-center gap-2 text-body-lg font-bold text-onSurface m-0 leading-none;
}

.filter-close {
  @apply flex items-center justify-center w-8 h-8 rounded-full border-none bg-transparent text-onSurface-variant cursor-pointer transition-all duration-200 hover:bg-black/10 hover:text-onSurface;
}

.filter-close :deep(svg) {
  font-size: 1.25rem;
}

/* ── Scroll area ── */
.filter-scroll {
  @apply max-h-full overflow-y-auto px-4 py-3;
  touch-action: pan-y;
}

.filter-scroll::-webkit-scrollbar {
  width: 4px;
}

.filter-scroll::-webkit-scrollbar-thumb {
  background-color: #c5c6cd;
  border-radius: 4px;
}

/* ── Grid layout ── */
.filter-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3;
}

/* ── Group ── */
.filter-group {
  @apply mb-3 sm:mb-0;
}

.filter-fieldset {
  @apply border-none p-0 m-0;
}

.filter-group-title {
  @apply text-secondary text-label-md font-semibold uppercase tracking-[0.5px] mb-3;
}

/* ── Custom checkbox ── */
.custom-check-group {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1;
}

.form-check {
  @apply relative flex items-center cursor-pointer select-none py-0.5;
}

/* Hide native checkbox visually but keep accessible */
.form-check-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Custom checkmark box */
.form-check-checkmark {
  @apply flex items-center justify-center w-5 h-5 rounded-round-default border-2 border-outline bg-white flex-shrink-0 transition-all duration-150 mr-3;
}

.form-check-input:focus-visible + .form-check-checkmark {
  @apply ring-2 ring-secondary ring-offset-1;
}

.form-check-input:checked + .form-check-checkmark {
  @apply bg-secondary border-secondary;
}

.form-check-input:checked + .form-check-checkmark .check-icon {
  opacity: 1;
  transform: scale(1);
}

.check-icon {
  @apply text-white text-xs;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.form-check-label {
  @apply text-body-md cursor-pointer transition-colors duration-150 hover:text-secondary;
}

.form-check:hover .form-check-checkmark {
  @apply border-secondary/60;
}

.form-check:hover .check-icon {
  @apply text-secondary/40;
}

.form-check-input:checked:hover + .form-check-checkmark {
  @apply bg-secondary/90 border-secondary/90;
}

/* ── Scrollable sub-groups ── */
.scrollable-group {
  @apply overflow-y-auto pr-2 max-h-[12rem];
}

.scrollable-group::-webkit-scrollbar {
  width: 6px;
}

.scrollable-group::-webkit-scrollbar-track {
  background-color: transparent;
}

.scrollable-group::-webkit-scrollbar-thumb {
  background-color: #c5c6cd;
  border-radius: 3px;
}

.scrollable-group::-webkit-scrollbar-thumb:hover {
  background-color: #75777d;
}
</style>

/* ── Non-scoped: slot content (map type toggle) ── */
<style lang="postcss">
.filter-group-title {
  @apply text-secondary text-label-md font-semibold uppercase tracking-[0.5px] mb-3;
}
</style>
