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
  <b-container class="about">
    <h1>About this App</h1>
    <p>
      All projects of the
      <a href="https://www.joerg-wolff-stiftung.de/">Jörg Wolff Foundation</a>
      are shown on this overview map.
      Completed projects are marked with colored pins, while planned or
      under-construction projects are marked in gray.
    </p>
    <h3>Development</h3>
    <p>Stephan Strittmatter</p>
    <p>
      Sources:
      <a href="https://github.com/stritti/jws-project-map" target="_blank">
        GitHub
      </a>
    </p>
    <p>Version: {{ version }}</p>

    <!-- Neuer Reload-Button -->
    <b-button @click="reloadApp" variant="primary" class="mt-3">
      App neu laden und Cache leeren
    </b-button>

    <h3>Credits</h3>

    <ul>
      <li>
        <a href="https://nocodb.com/" target="_blank">NocoDB</a>
      </li>
      <li>
        <a href="https://vuejs.org" target="_blank">vue.js</a>, MIT License
      </li>
      <li>
        <a href="https://leafletjs.com/" target="_blank">Leaflet</a>,
        OpenStreetMap
      </li>
      <li>
        and more
        <a
          href="https://github.com/stritti/jws-project-map/blob/main/package.json"
          target="_blank"
        >
          awesome libs &hellip;
        </a>
      </li>
    </ul>
  </b-container>
</template>
