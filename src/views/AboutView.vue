<script setup lang="ts">
const version = import.meta.env.PACKAGE_VERSION;
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
