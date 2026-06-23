<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { i18n, setLocale, type Locale } from "@/plugins/i18n";

const { t } = useI18n();
const route = useRoute();

import IBiThreeDots from "~icons/bi/three-dots";
import IBiInfoCircle from "~icons/bi/info-circle";
import AboutModal from "./AboutModal.vue";

const isOpen = ref(false);
const aboutModalRef = ref<InstanceType<typeof AboutModal> | null>(null);

// Route-based CSS class to adjust bottom offset on mobile
const routeClass = computed(() => {
  if (route.name === "ProjectDetail") return "on-detail";
  if (route.name === "home" || route.name === "ProjectList") return "on-filter-view";
  return "";
});

const languages: { code: Locale; flag: string }[] = [
  { code: "de", flag: "de" },
  { code: "en", flag: "gb" },
  { code: "fr", flag: "fr" },
];

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

function handleLang(locale: Locale) {
  setLocale(locale);
  close();
}

function handleAbout() {
  close();
  aboutModalRef.value?.show();
}

function onClickOutside(event: MouseEvent) {
  const el = document.querySelector(".floating-meta");
  if (el && !el.contains(event.target as Node)) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <div class="floating-meta" :class="[{ open: isOpen }, routeClass]">
    <!-- Expand/collapse trigger -->
    <button
      class="meta-trigger"
      :aria-label="isOpen ? t('nav.close') : t('nav.more')"
      :title="isOpen ? t('nav.close') : t('nav.more')"
      @click="toggle"
    >
      <IBiThreeDots class="trigger-icon" aria-hidden="true" />
    </button>

    <!-- Expanded panel -->
    <Transition name="meta-fade">
      <div v-if="isOpen" class="meta-panel">
        <!-- Language flags -->
        <div class="meta-langs">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="meta-lang-btn"
            :class="{ active: (i18n.global.locale as unknown as string) === lang.code }"
            :lang="lang.code"
            :aria-label="lang.code.toUpperCase()"
            @click="handleLang(lang.code)"
          >
            <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
          </button>
        </div>

        <div class="meta-divider" />

        <!-- About button -->
        <button class="meta-about-btn" @click="handleAbout">
          <IBiInfoCircle aria-hidden="true" />
          <span>{{ t("nav.about") }}</span>
        </button>
      </div>
    </Transition>

    <AboutModal ref="aboutModalRef" />
  </div>
</template>

<style lang="postcss" scoped>
.floating-meta {
  @apply fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-[999] flex flex-col-reverse items-end gap-[0.5rem];

  /* On mobile, raise above search bar + map controls. */
  @media (max-width: 767.98px) {
    @apply bottom-[calc(8rem+env(safe-area-inset-bottom,0px))];

    /* On HomeView / ProjectListView: sit just above the bottom filter/search bar (~4rem tall) */
    &.on-filter-view {
      @apply bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))];
    }

    /* On ProjectDetailView: no bottom bar, so place near the screen edge */
    &.on-detail {
      @apply bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))];
    }
  }
}

.meta-trigger {
  /* 44px matches the iOS HIG minimum touch target size */
  @apply w-[44px] h-[44px] rounded-full border border-black/6 bg-white/88 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer flex items-center justify-center text-onSurface transition-all duration-200;

  &:hover {
    @apply bg-white/96 shadow-[0_4px_20px_rgba(0,0,0,0.12)] text-secondary;
  }

  .trigger-icon {
    @apply text-[1.35rem] leading-none;
  }
}

.open .meta-trigger {
  @apply bg-secondary border-secondary text-white shadow-[0_4px_16px_rgba(61,94,158,0.25)];

  &:hover {
    @apply bg-secondary text-white;
  }
}

.meta-panel {
  @apply bg-white/92 backdrop-blur-xl border border-black/6 rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-[0.5rem] flex flex-col gap-[0.25rem] min-w-[100px];
}

.meta-langs {
  @apply flex gap-[0.25rem] p-[0.25rem];
}

.meta-lang-btn {
  @apply flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border-none bg-transparent cursor-pointer p-0 transition-all duration-150 opacity-40 grayscale-[0.6];

  &:hover {
    @apply opacity-80 grayscale-0 bg-secondary/8;
  }

  &.active {
    @apply opacity-100 grayscale-0 bg-secondary;

    :deep(.fi) {
      @apply shadow-[0_0_0_1.5px_#fff];
    }
  }

  :deep(.fi) {
    @apply text-base rounded-[2px];
  }
}

.meta-divider {
  @apply h-px bg-black/6 my-[0.15rem] mx-[0.25rem];
}

.meta-about-btn {
  @apply flex items-center gap-[0.5rem] px-[0.75rem] py-[0.4rem] rounded-[8px] border-none bg-transparent cursor-pointer text-[0.8rem] text-onSurface transition-all duration-150 whitespace-nowrap;

  &:hover {
    @apply bg-secondary/8 text-secondary;
  }

  :deep(svg) {
    @apply text-base;
  }
}

/* Transition */
.meta-fade-enter-active,
.meta-fade-leave-active {
  @apply transition-all duration-200 ease;
}

.meta-fade-enter-from,
.meta-fade-leave-to {
  @apply opacity-0 -translate-y-2 scale-95;
}
</style>
