<template>
  <Transition name="slide-up">
    <div v-if="project && isOpened" class="project-card-overlay" @click="onCardClick">
      <div class="project-card-container">
        <!-- Close button — stop propagation to prevent navigation -->
        <button class="close-btn" @click.stop="onClose" :aria-label="t('common.close')">
          <IBiX />
        </button>

        <!-- Use ProjectListItem with actions slot — entire card links to detail page -->
        <project-list-item :project="project">
          <template #actions>
            <button class="details-btn" @click.stop="goToDetail">
              <IBiBoxArrowUpRight />
            </button>
            <navigate-button
              :lat="project.latitude"
              :lng="project.longitude"
            />
          </template>
        </project-list-item>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useWebFrame } from "@/composables/useWebFrame";
import ProjectListItem from "./ProjectListItem.vue";
import type { Project } from "../../interfaces/Project";

import IBiX from "~icons/bi/x";
import IBiBoxArrowUpRight from "~icons/bi/box-arrow-up-right";

const { t } = useI18n();
const { navigateToProject } = useWebFrame();

const props = defineProps({
  project: {
    type: Object as PropType<Project>,
    required: false,
  },
  isOpened: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

function onClose(): void {
  emit("close");
}

function onCardClick(): void {
  if (props.project) {
    navigateToProject(props.project);
  }
}

function goToDetail(): void {
  if (props.project) {
    navigateToProject(props.project);
  }
}
</script>

<style lang="postcss">
/* Bottom navigation height (MainMenu content + padding) */
/* Must account for safe-area-inset-bottom on notched devices. */
.project-card-overlay {
  @apply fixed bottom-[calc(64px+var(--spacing-unit)*3+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[1002] w-[90%] max-w-[600px];
}

.project-card-container {
  @apply relative;
}

.close-btn {
  @apply absolute -top-[calc(var(--spacing-unit)*1.5)] -right-[calc(var(--spacing-unit)*1.5)] z-10 w-8 h-8 rounded-full border-none bg-surface text-onSurface shadow-[0_var(--spacing-unit)_calc(var(--spacing-unit)*3)_rgba(9,20,38,0.12)] cursor-pointer flex items-center justify-center transition-[background-color,transform] duration-200;

  &:hover {
    @apply bg-surface-variant scale-110;
  }
}

.details-btn {
  @apply flex items-center justify-center p-[var(--spacing-unit)] w-[36px] h-[36px] bg-primary text-white rounded-round-default hover:bg-primary-dark transition-colors duration-200;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  @apply transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)];
}

.slide-up-enter-from,
.slide-up-leave-to {
  @apply opacity-0 -translate-x-1/2 translate-y-[20px];
}

.slide-up-enter-to,
.slide-up-leave-from {
  @apply opacity-100 -translate-x-1/2 translate-y-0;
}
</style>
