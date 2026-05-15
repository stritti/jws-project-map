<template>
  <div class="filter-dropdown">
    <button class="filter-close" :aria-label="t('common.close')" @click="emit('close')">
      <span aria-hidden="true">&times;</span>
    </button>
    <b-card bg-variant="white" class="shadow-sm border-0 rounded-4 filter-card">
      <div class="filter-scroll">
        <b-row>
          <b-col md="4">
            <div class="filter-group mb-4 mb-md-0">
              <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                <IBiCheck2Circle /> {{ t("search.filterGroups.status") }}
              </h6>
              <b-form-checkbox-group
                v-model="stateFilter"
                name="stateFilter"
                stack
                class="custom-check-group"
              >
                <b-form-checkbox v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                  {{ opt.text }}
                </b-form-checkbox>
              </b-form-checkbox-group>
            </div>
          </b-col>
          <b-col md="4">
            <div class="filter-group mb-4 mb-md-0">
              <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                <IBiTag /> {{ t("search.filterGroups.categories") }}
              </h6>
              <b-form-checkbox-group
                v-model="categoryFilter"
                stack
                class="custom-check-group scrollable-group"
              >
                <b-form-checkbox v-for="cat in categoryList" :key="cat.value" :value="cat.value">
                  {{ cat.text }}
                </b-form-checkbox>
              </b-form-checkbox-group>
            </div>
          </b-col>
          <b-col md="4">
            <div class="filter-group">
              <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                <IBiGeoAlt /> {{ t("search.filterGroups.countries") }}
              </h6>
              <b-form-checkbox-group
                v-model="countryFilter"
                stack
                class="custom-check-group scrollable-group"
              >
                <b-form-checkbox v-for="c in countryList" :key="c.value" :value="c.value">
                  {{ c.text }}
                </b-form-checkbox>
              </b-form-checkbox-group>
            </div>
          </b-col>
        </b-row>
        <slot />
      </div>
    </b-card>
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

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.filter-dropdown {
  position: relative;
}

.filter-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08) !important;
}

.filter-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.filter-close:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.filter-scroll {
  max-height: inherit;
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-outline-variant, #c5c6cd);
    border-radius: 2px;
  }
}

.filter-group-title {
  color: var(--color-secondary);
  font-weight: var(--font-weight-label-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: var(--font-size-label-sm);
}

.custom-check-group {
  .form-check {
    margin-bottom: calc(var(--spacing-unit) * 2);
    padding-left: calc(var(--spacing-unit) * 7);

    .form-check-input {
      width: calc(var(--spacing-unit) * 5);
      height: calc(var(--spacing-unit) * 5);
      margin-left: calc(-1 * var(--spacing-unit) * 7);
      cursor: pointer;
      border-radius: var(--shape-round-default);

      &:checked {
        background-color: var(--color-secondary);
        border-color: var(--color-secondary);
      }
    }

    .form-check-label {
      cursor: pointer;
      font-size: var(--font-size-body-md);
      transition: color 0.2s ease;

      &:hover {
        color: var(--color-secondary);
      }
    }
  }
}

.scrollable-group {
  overflow-y: auto;
  padding-right: calc(var(--spacing-unit) * 2);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-outline-variant);
    border-radius: 5px;

    &:hover {
      background: var(--color-outline);
    }
  }
}
</style>

/* Non-scoped: same class also reaches slot content (map type toggle heading) */
<style lang="scss">
.filter-group-title {
  color: var(--color-secondary);
  font-weight: var(--font-weight-label-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: var(--font-size-label-sm);
}
</style>
