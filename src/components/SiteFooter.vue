<template>
  <footer role="contentinfo" class="footer">
    <div class="container mx-auto px-4 pb-[calc(72px+env(safe-area-inset-bottom,0px))]">
      <p class="m-0 text-label-sm text-onSurface-variant">
        <strong
          ><a href="https://www.joerg-wolff-stiftung.de/" class=" text-onSurface hover:text-primary hover:underline">
            Jorg Wolff Stiftung</a
          ></strong
        >, Klner Strae 8, 70376 Stuttgart, Germany
      </p>
      <p class="mt-3 text-label-sm text-onSurface-variant">
        Tel. +49 (0) 711/540 04-10,
        <a href="mailto:info@joerg-wolff-stiftung.de" class="hover:text-primary hover:underline">
          info@joerg-wolff-stiftung.de</a
        >
      </p>
      <p v-if="version" class="mt-3 text-label-sm text-onSurface-variant">
        Version: {{ version }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAppVersion } from '@/composables/useAppVersion';

const { version } = useAppVersion();
</script>

<style lang="postcss" scoped>
.footer {
  @apply mx-0 bg-surface border-t border-outline-variant;
}
</style>
