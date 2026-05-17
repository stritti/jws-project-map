<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { i18n, setLocale, type Locale } from "@/plugins/i18n";

const { t } = useI18n();

import IBiThreeDots from "~icons/bi/three-dots";
import IBiInfoCircle from "~icons/bi/info-circle";
import AboutModal from "./AboutModal.vue";

const isOpen = ref(false);
const aboutModalRef = ref<InstanceType<typeof AboutModal> | null>(null);

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
  <div class="floating-meta" :class="{ open: isOpen }">
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

<style lang="scss" scoped>
.floating-meta {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  right: calc(1rem + env(safe-area-inset-right, 0px));
  z-index: 999;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 0.5rem;

  // On mobile, raise above search bar + map controls.
  @media (max-width: 767.98px) {
    bottom: calc(8rem + env(safe-area-inset-bottom, 0px));
  }
}

.meta-trigger {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface, #1e293b);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    color: var(--color-secondary, #3d5e9e);
  }

  .trigger-icon {
    font-size: 1.2rem;
    line-height: 1;
  }
}

.open .meta-trigger {
  background: var(--color-secondary, #3d5e9e);
  border-color: var(--color-secondary, #3d5e9e);
  color: #fff;
  box-shadow: 0 4px 16px rgba(61, 94, 158, 0.25);

  &:hover {
    background: var(--color-secondary, #3d5e9e);
    color: #fff;
  }
}

.meta-panel {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 100px;
}

.meta-langs {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
}

.meta-lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
  opacity: 0.4;
  filter: grayscale(0.6);

  &:hover {
    opacity: 0.8;
    filter: grayscale(0);
    background: rgba(60, 93, 157, 0.08);
  }

  &.active {
    opacity: 1;
    filter: grayscale(0);
    background: var(--color-secondary, #3d5e9e);

    :deep(.fi) {
      box-shadow: 0 0 0 1.5px #fff;
    }
  }

  :deep(.fi) {
    font-size: 1rem;
    border-radius: 2px;
  }
}

.meta-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0.15rem 0.25rem;
}

.meta-about-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--color-on-surface, #1e293b);
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(60, 93, 157, 0.08);
    color: var(--color-secondary, #3d5e9e);
  }

  :deep(svg) {
    font-size: 1rem;
  }
}

// Transition
.meta-fade-enter-active,
.meta-fade-leave-active {
  transition: all 0.2s ease;
}

.meta-fade-enter-from,
.meta-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
