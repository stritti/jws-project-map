<template>
  <div class="filter-dropdown" role="complementary" :aria-label="t('a11y.filterPanel')">
    <button class="filter-close" :aria-label="t('common.close')" @click="emit('close')">
      <span aria-hidden="true">&times;</span>
    </button>
    <div class="filter-card">
      <div class="filter-scroll">
        <div class="filter-grid">
          <div class="filter-group mb-4 md:mb-0">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title mb-3 flex items-center gap-2">
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
                  <span class="form-check-label">{{ opt.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
          <div class="filter-group mb-4 md:mb-0">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title mb-3 flex items-center gap-2">
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
                  <span class="form-check-label">{{ cat.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
          <div class="filter-group">
            <fieldset class="filter-fieldset">
              <legend class="filter-group-title mb-3 flex items-center gap-2">
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
  @apply relative;
}

.filter-card {
  @apply bg-white shadow-lg border-0 rounded-round-xl;
}

.filter-close {
  @apply absolute top-2 right-2 z-10 w-8 h-8 rounded-full border-none bg-black/10 text-onSurface flex items-center justify-center text-[22px] cursor-pointer leading-none transition-all duration-200 hover:bg-black/15 hover:scale-110;
}

.filter-scroll {
  @apply max-h-full overflow-hidden;
}

.filter-scroll::-webkit-scrollbar {
  width: 1px;
}

.filter-scroll::-webkit-scrollbar-thumb {
  background-color: #c5c6cd;
  border-radius: 2px;
}

/* Fieldset/legend styling */
.filter-fieldset {
  @apply border-none p-0 m-0;
}

.filter-fieldset legend {
  @apply float-none w-auto p-0 text-secondary text-label-md uppercase tracking-[0.5px] text-label-sm mb-[0.75rem];
}

.filter-group-title {
  @apply text-secondary text-label-md uppercase tracking-[0.5px] text-label-sm;
}

.filter-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.custom-check-group {
  @apply space-y-2;
}

.form-check {
  @apply flex items-center cursor-pointer;
}

.form-check-input {
  @apply w-5 h-5 rounded-round-default border border-outline text-primary cursor-pointer mr-3 focus:ring-2 focus:ring-primary focus:border-transparent;
}

.form-check-input:checked {
  @apply bg-secondary border-secondary;
}

.form-check-label {
  @apply text-body-md cursor-pointer transition-colors duration-200 hover:text-secondary;
}

.scrollable-group {
  @apply overflow-y-auto pr-2;
}

.scrollable-group::-webkit-scrollbar {
  width: 10px;
}

.scrollable-group::-webkit-scrollbar-track {
  background-color: transparent;
}

.scrollable-group::-webkit-scrollbar-thumb {
  background-color: #c5c6cd;
  border-radius: 5px;
}

.scrollable-group::-webkit-scrollbar-thumb:hover {
  background-color: #75777d;
}
</style>

/* Non-scoped: same class also reaches slot content (map type toggle heading) */
<style lang="postcss">
.filter-group-title {
  @apply text-secondary text-label-md uppercase tracking-[0.5px] text-label-sm;
}
</style>
