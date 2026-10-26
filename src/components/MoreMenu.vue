<template>
  <div ref="moreMenuRef" class="more-menu" :class="{ open: moreOpen }">
    <button
      class="more-trigger"
      :aria-label="t('a11y.openMenu')"
      :title="t('nav.more')"
      :aria-expanded="moreOpen"
      :aria-haspopup="true"
      :aria-controls="morePanelId"
      @click="toggleMore"
      @keydown.enter="toggleMore"
      @keydown.space.prevent="toggleMore"
      @keydown.arrow-down.prevent="openMore; moreFocusIndex = 0"
    >
      <IBiThreeDots aria-hidden="true" />
    </button>

    <Teleport to="body" :disabled="!teleport">
      <Transition name="more-flyout" @after-enter="onMorePanelEnter">
        <div
          v-if="moreOpen"
          :id="morePanelId"
          ref="morePanelRef"
          class="more-panel"
          :class="{ teleported }"
          :style="panelInlineStyle"
          role="menu"
          :aria-label="t('nav.more')"
          @keydown="onMorePanelKeydown"
        >
          <div class="more-section" role="group" :aria-label="t('a11y.languageSelector')">
            <button
              v-for="(lang, index) in languages"
              :key="lang.code"
              class="more-option"
              :class="{ active: currentLocale === lang.code }"
              role="menuitemradio"
              :lang="lang.code"
              :aria-current="currentLocale === lang.code ? 'true' : undefined"
              :aria-checked="currentLocale === lang.code"
              :tabindex="moreFocusIndex === index ? 0 : -1"
              @click="switchLocale(lang.code); closeMore()"
              @focus="moreFocusIndex = index"
              @keydown.enter="switchLocale(lang.code); closeMore()"
              @keydown.space.prevent="switchLocale(lang.code); closeMore()"
              @keydown.arrow-up.prevent="moreFocusIndex = index > 0 ? index - 1 : languages.length - 1"
              @keydown.arrow-down.prevent="moreFocusIndex = index < languages.length - 1 ? index + 1 : 0"
              @keydown.escape.prevent="closeMore()"
            >
              <span :class="`fi fis fi-${lang.flag}`" aria-hidden="true" />
              <span>{{ lang.label }}</span>
              <span v-if="currentLocale === lang.code" class="more-check" aria-hidden="true"></span>
            </button>
          </div>

          <div class="more-divider" role="separator" aria-hidden="true"></div>

          <button
            class="more-option"
            role="menuitem"
            :tabindex="moreFocusIndex === languages.length ? 0 : -1"
            @click="$emit('about'); closeMore()"
            @focus="moreFocusIndex = languages.length"
            @keydown.enter="$emit('about'); closeMore()"
            @keydown.space.prevent="$emit('about'); closeMore()"
            @keydown.arrow-up.prevent="moreFocusIndex = languages.length - 1"
            @keydown.escape.prevent="closeMore()"
          >
            <IBiInfoCircle aria-hidden="true" />
            <span>{{ t('nav.about') }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale, type Locale } from "@/plugins/i18n";
import { useProjectStore } from "@/features/projects/stores/project.store";

import IBiThreeDots from "~icons/bi/three-dots";
import IBiInfoCircle from "~icons/bi/info-circle";

defineEmits<{
  (e: "about"): void;
}>();

const props = withDefaults(defineProps<{
  teleport?: boolean;
}>(), {
  teleport: false,
});

const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

const moreOpen = ref(false);
const moreMenuRef = ref<HTMLElement | null>(null);
const morePanelRef = ref<HTMLElement | null>(null);
const moreFocusIndex = ref(-1);
const morePanelId = ref(`more-menu-panel-${Math.random().toString(36).substr(2, 9)}`);

const isMobileView = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
});

const panelPosition = ref({ right: "0px", bottom: "0px", top: "" });
const teleported = computed(() => props.teleport && moreOpen.value);

const panelInlineStyle = computed(() => {
  if (!teleported.value) return {};
  return {
    right: panelPosition.value.right,
    bottom: panelPosition.value.bottom,
    top: panelPosition.value.top,
  };
});

const languages = [
  { code: "en", label: "English", flag: "us" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "fr", label: "Fran\u00e7ais", flag: "fr" },
];

function switchLocale(lang: string) {
  setLocale(lang as Locale);
}

function toggleMore() {
  moreOpen.value = !moreOpen.value;
  if (moreOpen.value) {
    nextTick(() => {
      updatePanelPosition();
      const firstOption = morePanelRef.value?.querySelector<HTMLElement>('.more-option');
      firstOption?.focus();
    });
  }
}

function openMore() {
  moreOpen.value = true;
  nextTick(() => {
    const firstOption = morePanelRef.value?.querySelector<HTMLElement>('.more-option');
    firstOption?.focus();
  });
}

function closeMore() {
  moreOpen.value = false;
  nextTick(() => {
    moreMenuRef.value?.querySelector<HTMLElement>('.more-trigger')?.focus();
  });
}

function updatePanelPosition() {
  if (!moreMenuRef.value || !morePanelRef.value) return;
  const trigger = moreMenuRef.value.querySelector<HTMLElement>('.more-trigger');
  if (!trigger) return;
  const triggerRect = trigger.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const panelHeight = 200;
  const rightOffset = Math.max(0, viewportWidth - triggerRect.right);
  if (triggerRect.bottom + panelHeight > viewportHeight) {
    panelPosition.value = {
      right: `${rightOffset}px`,
      bottom: `${viewportHeight - triggerRect.top + 8}px`,
      top: "",
    };
  } else {
    panelPosition.value = {
      right: `${rightOffset}px`,
      bottom: "",
      top: `${triggerRect.bottom + 8}px`,
    };
  }
}

function onMorePanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMore();
  } else if (e.key === 'Tab') {
    const options = morePanelRef.value?.querySelectorAll<HTMLElement>('.more-option');
    if (!options || options.length === 0) return;
    const first = options[0];
    const last = options[options.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function onMorePanelEnter() {
  updatePanelPosition();
}

onMounted(() => {
  window.addEventListener('resize', updatePanelPosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePanelPosition);
});
</script>

<style lang="postcss" scoped>
@reference "../assets/main.css";
.more-menu {
  @apply relative inline-block;
}
.more-trigger {
  @apply w-8 h-8 rounded-full border-none bg-transparent text-onSurface flex items-center justify-center text-[1.5rem] cursor-pointer leading-none transition-all duration-200 hover:bg-black/10 focus:outline-2 focus:outline-secondary focus:outline-offset-2;
}
.more-panel {
  @apply absolute z-[1000] bg-white rounded-round-xl shadow-lg border border-outline p-2 min-w-[180px] overflow-hidden;
}
.more-panel.teleported {
  @apply fixed;
}
.more-section {
  @apply py-1;
}
.more-option {
  @apply w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-md text-onSurface cursor-pointer transition-colors duration-150 whitespace-nowrap focus:outline-2 focus:outline-secondary focus:outline-offset-2;
}
.more-option:hover {
  @apply bg-surface-variant;
}
.more-option.active {
  @apply bg-secondary text-white;
}
.more-option .more-check {
  @apply ml-auto text-secondary;
}
.more-option.active .more-check {
  @apply text-white;
}
.more-divider {
  @apply h-px bg-outline-variant my-1 mx-2;
}
.more-flyout-enter-active,
.more-flyout-leave-active {
  @apply transition-all duration-200 ease-out;
}
.more-flyout-enter-from,
.more-flyout-leave-to {
  @apply opacity-0 scale-95;
}
.more-flyout-enter-to,
.more-flyout-leave-from {
  @apply opacity-100 scale-100;
}
</style>
