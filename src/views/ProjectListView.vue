<template>
  <div class="container mx-auto px-2 md:px-4">
    <div class="project-list" role="main" aria-label="Project list">
      <div class="list-header" :class="{ 'header-scrolled': headerScrolled }">
        <h1 id="project-list-title">{{ t("app.title") }}</h1>

        <div v-if="isDataLoading" class="skeleton-grid" role="status" aria-live="polite">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="skeleton-card" role="article" aria-busy="true">
              <div class="flex h-full">
                <div class="w-5/12 skeleton-image-col">
                  <div class="skeleton-image" aria-hidden="true"></div>
                </div>
                <div class="w-7/12 skeleton-content-col">
                  <div class="skeleton-content" aria-hidden="true">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-category" style="width: 65%"></div>
                    <div class="skeleton-country" style="width: 45%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <h3 class="my-3 text-onSurface-variant text-body-lg" id="project-count">
            {{ t("search.stats", { total: projectCount, ub: projectsUnderConstructionCount, pl: projectsPlannedCount }) }}
          </h3>
        </div>
      </div><!-- /.list-header -->

      <!-- Filter overlay  position:fixed on mobile (bottom) so it must NOT be
           inside .list-header (which has backdrop-filter that breaks fixed
           positioning in Chrome).  On desktop it flows in normal document order. -->
      <div class="filter-overlay-container" :class="{ 'search-active': isSearchActive }">
        <div class="toolbar-section">
          <MainMenu
            v-model="searchQuery"
            v-model:state-filter="stateFilterSearch"
            :placeholder="t('search.placeholder')"
            :filter-label="t('search.filter')"
            :show-filter-chips="false"
            :filter-count="activeFiltersCount"
            :filter-visible="filterVisible"
            view-mode="list"
            @filter-click="filterVisible = !filterVisible"
            @state-change="handleStateFilterChange"
            @view-change="() => $router.push('/')"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
        </div>

        <!-- Filter backdrop (mobile only) -->
        <div v-if="filterVisible" class="filter-backdrop" @click="filterVisible = false" aria-hidden="true" />

        <!-- Filter panel overlays the list via absolute positioning -->
        <FilterPanel v-if="filterVisible" @close="filterVisible = false" />
      </div>
      <div class="pt-16 md:pt-0 mb-4 text-onSurface-variant text-body-md" v-if="filteredProjectList.length !== finalProjectList.length || activeFiltersCount > 0 || searchQuery" aria-live="polite">
        {{ t("search.resultsCount", { count: finalProjectList.length }) }}
      </div>
      <!-- Screen reader announcement for filter result count -->
      <div class="sr-only" role="status" aria-live="polite">
        {{ t("a11y.filterResultsAnnouncement", { count: finalProjectList.length }) }}
      </div>
      <div v-if="!isDataLoading" class="my-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" :aria-label="t('a11y.projectList')">
        <div
          v-for="project in finalProjectList"
          :key="project.id"
          class="h-full"
          role="listitem"
        >
          <project-list-item
            :project="project"
            :to="projectRoute(project)"
            class="h-full"
          />
        </div>
        <div v-if="finalProjectList.length === 0" class="no-results py-5 text-center" role="status" aria-live="polite">
          <div class="text-[4rem] text-onSurface-variant opacity-25 mb-4">
            <IBiEmojiDizzy aria-hidden="true" />
          </div>
          <h3>{{ t("search.noResultsTitle") }}</h3>
          <p class="text-onSurface-variant">{{ t("search.noResultsHint") }}</p>
          <button 
            @click="clearAllFilters" 
            class="mt-3 rounded-full px-4 py-2 bg-transparent text-primary border border-primary hover:bg-primary hover:text-white transition-colors focus:outline-2 focus:outline-secondary focus:outline-offset-2"
            :aria-label="t('search.resetFilters')"
          >
            {{ t("search.resetFilters") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../stores/loading.store";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "../stores/category.store";
