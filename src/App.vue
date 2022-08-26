<template>
  <main>
    <router-view />
  </main>
  <nav>
    <main-menu  class="menu" />
  </nav>
</template>

<script>
import MainMenu from '@/components/MainMenu.vue'

export default {
  name: 'App',
  components: {
    MainMenu
  }
}
</script>

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

.menu {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: calc(1rem + env(safe-area-inset-left));
}
</style>

