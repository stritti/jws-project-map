<template>
  <div class="project-page" role="main" aria-label="Project details">
    <!-- Sticky header bar: back button + project title -->
    <header class="page-header-sticky" :class="{ 'header-scrolled': headerScrolled }">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="flex items-center py-2" role="status" aria-live="polite">
          <div class="w-11 h-11 rounded-full animate-pulse bg-outline-variant/20" aria-hidden="true"></div>
          <div class="ml-4 flex-1">
            <h2 class="w-1/2 h-8 animate-pulse bg-outline-variant/20 rounded" aria-hidden="true"></h2>
          </div>
        </div>
        <div v-if="project" class="page-header flex flex-wrap items-center gap-3 py-2">
          <back-button v-if="!isIFrame" class="back-btn shadow-sm hidden md:flex" />
          <h1 class="title mb-0 flex-grow-1 font-bold" id="project-title">
            {{ project.name }}
          </h1>
        </div>
      </div>
    </header>

    <!-- Floating back button for mobile -->
    <button
      v-if="!isIFrame && project"
      class="floating-back-btn md:hidden"
      :aria-label="t('a11y.backToList')"
      :title="t('a11y.backToList')"
      @click="goBack"
      @keydown.enter="goBack"
      @keydown.space.prevent="goBack"
    >
      <IBiArrowLeft class="floating-back-icon" aria-hidden="true" />
    </button>

    <div class="container mx-auto px-0 md:px-3">
      <div v-if="loading" class="w-full h-[40vh] rounded-round-xl mb-4 animate-pulse bg-outline-variant/20" role="status" aria-live="polite" aria-busy="true"></div>
      <div v-if="project" class="teaser-wrapper">
        <div
          class="teaser-card"
          :style="{ backgroundImage: `url(${teaserImage})` }"
          role="img"
          :aria-label="`${project.name} ${t('project.detail.location')}`"
        >
          <div class="action-bar flex gap-2" role="group" :aria-label="t('a11y.shareProject')">
            <share-button
              class="action-btn share glass-btn"
              :title="project.name"
              :text="project.name"
              :url="$route.path"
              :fixed="false"
            />
            <navigate-button
              class="action-btn navigate glass-btn"
              :lat="project.latitude"
              :lng="project.longitude"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto mt-5 px-4">
      <div class="project-details">
        <div v-if="loading" class="info-grid mb-5" role="status" aria-live="polite">
          <div v-for="i in 3" :key="i" class="h-20 rounded-round-large animate-pulse bg-outline-variant/20" aria-hidden="true"></div>
        </div>
        <div v-if="loading" class="space-y-2" role="status" aria-live="polite">
          <div class="w-4/5 h-6 animate-pulse bg-outline-variant/20 rounded mb-2" aria-hidden="true"></div>
          <div class="w-2/3 h-6 animate-pulse bg-outline-variant/20 rounded mb-2" aria-hidden="true"></div>
          <div class="w-3/4 h-6 animate-pulse bg-outline-variant/20 rounded" aria-hidden="true"></div>
        </div>

        <div v-if="project">
          
          <!-- Category tiles -->
          <div v-if="project.category?.length" class="category-tiles mb-4" role="list" :aria-label="t('a11y.categoriesFilter')">
            <div
              v-for="category in project.category"
              :key="category.id"
              class="category-tile"
              :style="categoryTileStyle(category.id)"
              role="listitem"
            >
              {{ categoryName(category.id) }}
            </div>
          </div>

          <div class="info-grid mb-5" role="region" aria-label="Project information">
            <div class="info-card" v-if="project.country">
              <div class="info-icon" aria-hidden="true">
                <IBiGlobe2 />
              </div>
              <div class="info-content">
                <span class="info-label">{{ t("project.detail.country") }}</span>
                <strong class="info-value"><country-label :country-id="project.country.id" /></strong>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-icon" aria-hidden="true">
                <IBiCheck2Circle />
              </div>
              <div class="info-content">
                <span class="info-label">{{ t("project.detail.state") }}</span>
                <StateBadge :state="project.state" />
              </div>
