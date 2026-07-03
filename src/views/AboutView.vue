<script setup lang="ts">
const version = import.meta.env.PACKAGE_VERSION;

const reloadApp = async () => {
  // Cache löschen
  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      await caches.delete(key);
    }
  }

  // PWA neu laden
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  // Seite neu laden und Cache leeren
  window.location.reload();
};
</script>
<template>
  <div class="container mx-auto px-4 about">
    <h1>About this App</h1>
    <p class="text-body-lg leading-relaxed">
      All projects of the
      <a href="https://www.joerg-wolff-stiftung.de/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Jörg Wolff Foundation</a>
      are shown on this overview map.
      Completed projects are marked with colored pins, while planned or
      under-construction projects are marked in gray.
    </p>
    <h3 class="text-headline-md font-bold mt-6 mb-3">Development</h3>
    <p class="text-body-lg">Stephan Strittmatter</p>
    <p class="text-body-lg">
      Sources:
      <a href="https://github.com/stritti/jws-project-map" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
        GitHub
      </a>
    </p>
    <p class="text-body-lg">Version: {{ version }}</p>

    <!-- Reload Button -->
    <button @click="reloadApp" class="btn btn-primary mt-3">
      App neu laden und Cache leeren
    </button>

    <h3 class="text-headline-md font-bold mt-6 mb-3">Credits</h3>

    <ul class="list-disc list-inside space-y-2">
      <li>
        <a href="https://nocodb.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">NocoDB</a>
      </li>
      <li>
        <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">vue.js</a>, MIT License
      </li>
      <li>
        <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Leaflet</a>,
        OpenStreetMap
      </li>
      <li>
        and more
        <a
          href="https://github.com/stritti/jws-project-map/blob/main/package.json"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline font-semibold"
        >
          awesome libs &hellip;
        </a>
      </li>
    </ul>
  </div>
</template>
