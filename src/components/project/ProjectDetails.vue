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

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useWebFrame } from "@/composables/useWebFrame";
import ProjectListItem from "./ProjectListItem.vue";
import type { Project } from "../../interfaces/Project";

export default defineComponent({
  name: "ProjectDetails",
  components: { ProjectListItem },
  setup() {
    const { t } = useI18n();
    const { navigateToProject } = useWebFrame();
    return { t, navigateToProject };
  },
  props: {
    project: {
      type: Object as PropType<Project>,
      required: false,
    },
    isOpened: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close"],
  methods: {
    onClose() {
      this.$emit("close");
    },
    onCardClick() {
      if (this.project) {
        this.navigateToProject(this.project);
      }
    },
    goToDetail() {
      if (this.project) {
        this.navigateToProject(this.project);
      }
    },
  },
});
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
  @apply absolute -top-[calc(var(--spacing-unit)*1.5)] -right-[calc(var(--spacing-unit)*1.5)] z-10 w-8 h-8 rounded-full border-none bg-surface text-onSurface shadow-[0_var(--spacing-unit)_calc(var(--spacing-unit)*3)_rgba(9,20,38,0.12)] cursor-pointer flex items-center justify-center transition-all duration-200;
  
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
  @apply transition-all duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)];
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

