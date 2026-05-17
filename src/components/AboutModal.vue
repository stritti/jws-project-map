<template>
  <b-modal
    ref="modalRef"
    id="about-modal"
    :title="t('about.title')"
    size="lg"
    centered
    hide-footer
    header-class="border-0 pb-0"
    body-class="pt-2"
    content-class="rounded-4 border-0 shadow-lg"
  >
    <div class="about-content">
      <!-- Description -->
      <p class="about-description">
        <i18n-t keypath="about.description" tag="span">
          <template #foundation>
            <a href="https://www.joerg-wolff-stiftung.de/" target="_blank" rel="noopener noreferrer" class="fw-semibold">{{ t("about.foundation") }}</a>
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
        <b-button
          size="sm"
          variant="outline-primary"
          class="rounded-pill px-3 border-0 fw-semibold"
          @click="reloadApp"
        >
          <IBiArrowRepeat class="me-1" />
          {{ t("about.reload") }}
        </b-button>
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
          <a href="https://github.com/stritti/jws-project-map/blob/main/package.json" target="_blank" rel="noopener noreferrer" class="about-link fw-semibold">awesome libs &hellip;</a>
        </li>
      </ul>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const modalRef = ref<{ show: () => void; hide: () => void } | null>(null);

function show() {
  modalRef.value?.show();
}

function hide() {
  modalRef.value?.hide();
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

<style lang="scss" scoped>
.about-content {
  padding: 0 0.25rem;
}

.about-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-on-surface, #191c1d);
  margin: 0;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-variant, #45474c);
  margin-bottom: 0.35rem;
}

.about-value {
  font-size: 1rem;
  color: var(--color-on-surface, #191c1d);
  margin-bottom: 1rem;
}

.about-link {
  color: var(--color-secondary, #3d5e9e);
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.about-credits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    font-size: 0.95rem;
    color: var(--color-on-surface, #191c1d);
  }
}
</style>
