<template>
  <div class="filter-dropdown" role="complementary" :aria-label="t('a11y.filterPanel')">
    <div class="filter-card" role="region" aria-label="Filter options">
      <!-- Header -->
      <div class="filter-header">
        <h3 class="filter-title" id="filter-title">
          <IBiFunnel aria-hidden="true" /> {{ t("search.filter") }}
        </h3>
        <button 
          class="filter-close" 
          :aria-label="t('common.close')"
          @click="emit('close')"
          @keydown.enter="emit('close')"
          @keydown.space.prevent="emit('close')"
        >
          <IBiX aria-hidden="true" />
        </button>
      </div>

      <div class="filter-scroll">
        <form class="filter-grid" role="form" aria-labelledby="filter-title">
          <div class="filter-group sm:border-r sm:border-outline/20 sm:pr-3">
            <fieldset class="filter-fieldset" role="group" :aria-label="t('a11y.statusFilter')">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiCheck2Circle aria-hidden="true" /> {{ t("search.filterGroups.status") }}
              </legend>
              <div class="custom-check-group" role="group">
                <label v-for="opt in stateOptions" :key="opt.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="stateFilter"
                    :value="opt.value"
                    class="form-check-input"
                    :aria-label="opt.text"
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
            <fieldset class="filter-fieldset" role="group" :aria-label="t('a11y.categoriesFilter')">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiTag aria-hidden="true" /> {{ t("search.filterGroups.categories") }}
              </legend>
              <div class="custom-check-group scrollable-group" role="group">
                <label v-for="cat in categoryList" :key="cat.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="categoryFilter"
                    :value="cat.value"
                    class="form-check-input"
                    :aria-label="cat.text"
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
            <fieldset class="filter-fieldset" role="group" :aria-label="t('a11y.countriesFilter')">
              <legend class="filter-group-title flex items-center gap-2">
                <IBiGeoAlt aria-hidden="true" /> {{ t("search.filterGroups.countries") }}
              </legend>
              <div class="custom-check-group scrollable-group" role="group">
                <label v-for="c in countryList" :key="c.value" class="form-check">
                  <input
                    type="checkbox"
                    v-model="countryFilter"
                    :value="c.value"
                    class="form-check-input"
                    :aria-label="c.text"
                  />
                  <span class="form-check-checkmark" aria-hidden="true">
                    <IBiCheck class="check-icon" />
                  </span>
                  <span class="form-check-label">{{ c.text }}</span>
                </label>
              </div>
            </fieldset>
          </div>
        </form>
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
