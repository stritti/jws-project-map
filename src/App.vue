<script setup lang="ts">
import MainMenu from "./components/MainMenu.vue";
import SiteFooter from "./components/SiteFooter.vue";
import { useWebFrame } from "./composables/useWebFrame";

const { isIFrame } = useWebFrame();
</script>

<template>
  <div class="app-wrapper">
    <main class="content">
      <router-view />
    </main>
    <site-footer v-if="!isIFrame" />
    <nav>
      <main-menu v-if="!isIFrame" class="menu" />
    </nav>
  </div>
</template>

<style lang="scss">
body {
  font-family: Roboto, sans-serif !important;
}
h1 {
  color: rgb(61, 94, 158);
  font-size: 48px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
}
p {
  font-size: 16px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
}

.container {
  margin-top: env(safe-area-inset-top);
  margin-bottom: env(safe-area-inset-bottom);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex-grow: 1;
}

.menu {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: calc(1rem + env(safe-area-inset-left));
}
</style>
