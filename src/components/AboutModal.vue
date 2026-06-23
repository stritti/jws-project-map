<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="hide">
    <div class="modal-content rounded-round-xl border-0 shadow-lg bg-white max-w-md mx-4 my-8" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
      <div class="modal-header border-0 pb-0 flex items-center justify-between p-4">
        <h2 id="about-modal-title" class="text-headline-md font-bold text-onSurface">{{ t('about.title') }}</h2>
        <button class="close-btn" @click="hide" :aria-label="t('nav.close')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body pt-2 px-4 pb-4 max-h-[80vh] overflow-y-auto">
        <div class="about-content">
          <!-- Description -->
          <p class="about-description">
            <i18n-t keypath="about.description" tag="span">
              <template #foundation>
                <a href="https://www.joerg-wolff-stiftung.de/" target="_blank" rel="noopener noreferrer" class="font-semibold">{{ t("about.foundation") }}</a>
              </template>
            </i18n-t>
          </p>

          <hr class="my-4 opacity-25" />

          <!-- Development -->
          <h6 class="section-label">{{ t("about.development") }}</h6>
          <p class="about-value">{{ t("about.developer") }}</p>

          <!-- Sources -->
          <h6 class="section-label">{{ t("about.sources") }}</h6>
          <p class="about-value">
            <a href="https://github.com/stritti/jws-project-map" target="_blank" rel="noopener noreferrer" class="about-link">GitHub</a>
          </p>

          <!-- Version and Reload -->
          <div class="version-row">
            <span class="about-value">{{ t("about.version") }}: {{ version }}</span>
            <button
              class="btn btn-outline-primary rounded-full px-3 border-0 font-semibold text-sm"
              @click="reloadApp"
            >
              <IBiArrowRepeat class="mr-1" />
              {{ t("about.reload") }}
            </button>
          </div>

          <hr class="my-4 opacity-25" />

          <!-- Credits -->
          <h6 class="section-label">{{ t("about.credits") }}</h6>
          <ul class="about-credits">
            <li><a href="https://nocodb.com/" target="_blank" rel="noopener noreferrer" class="about-link">NocoDB</a></li>
            <li><a href="https://vuejs.org" target="_blank" rel="noopener noreferrer" class="about-link">vue.js</a>, {{ t("about.license") }}</li>
            <li><a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" class="about-link">Leaflet</a>, OpenStreetMap</li>
            <li>
              {{ t("about.moreLibs") }}
              <a href="https://github.com/stritti/jws-project-map/blob/main/package.json" target="_blank" rel="noopener noreferrer" class="about-link font-semibold">awesome libs &hellip;</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isVisible = ref(false);

function show() {
  isVisible.value = true;
  document.body.style.overflow = 'hidden';
}

function hide() {
  isVisible.value = false;
  document.body.style.overflow = '';
}

defineExpose({ show, hide });

const version = import.meta.env.PACKAGE_VERSION;

const reloadApp = async () => {
  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      await caches.delete(key);
    }
  }
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
  window.location.reload();
};
</script>

<style lang="postcss" scoped>
.about-content {
  @apply px-[0.25rem];

  @media (max-width: 575.98px) {
    @apply p-0;
  }
}

.about-description {
  @apply text-base leading-[1.6] text-onSurface m-0;

  @media (max-width: 575.98px) {
    @apply text-[0.875rem] leading-[1.5];
  }
}

.section-label {
  @apply text-[0.75rem] font-bold uppercase tracking-[0.1em] text-onSurface-variant mb-[0.35rem];
}

.about-value {
  @apply text-base text-onSurface mb-[1rem];

  @media (max-width: 575.98px) {
    @apply text-[0.875rem] mb-[0.5rem];
  }
}

.about-link {
  @apply text-secondary no-underline font-medium;

  &:hover {
    @apply underline;
  }
}

.version-row {
  @apply flex items-center justify-between gap-[1rem] flex-wrap;
}

.about-credits {
  @apply list-none p-0 m-0 flex flex-col gap-[0.5rem];

  li {
    @apply text-[0.95rem] text-onSurface;

    @media (max-width: 575.98px) {
      @apply text-[0.85rem];
    }
  }
}

.modal-overlay {
  @apply fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4;
}

.modal-content {
  @apply w-full max-w-md mx-4 my-8;
}

.modal-header {
  @apply border-0 pb-0 flex items-center justify-between p-4;

  @media (max-width: 575.98px) {
    @apply p-[0.75rem_1rem_0];
  }
}

.modal-body {
  @apply pt-2 px-4 pb-4 max-h-[80vh] overflow-y-auto;

  @media (max-width: 575.98px) {
    @apply p-[0.75rem_1rem];
  }
}

.close-btn {
  @apply w-8 h-8 rounded-full border-none bg-transparent text-onSurface flex items-center justify-center text-[22px] cursor-pointer leading-none transition-all duration-200 hover:bg-black/10;
}
</style>
