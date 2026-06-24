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
            <b-button variant="primary" size="sm" class="details-btn" @click.stop="goToDetail">
              <IBiBoxArrowUpRight />
            </b-button>
            <navigate-button
              size="sm"
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

<style lang="scss">
@use "@/assets/design-tokens.scss" as *;

// Bottom navigation height (MainMenu content + padding)
// Must account for safe-area-inset-bottom on notched devices.
$bottom-nav-height: 64px;

.project-card-overlay {
  position: fixed;
  bottom: calc($bottom-nav-height + var(--spacing-unit) * 3 + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1002;
  width: 90%;
  max-width: 600px;
}

.project-card-container {
  position: relative;
}

.close-btn {
  position: absolute;
  top: calc(var(--spacing-unit) * -1.5);
  right: calc(var(--spacing-unit) * -1.5);
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: var(--shape-round-full);
  border: none;
  background: var(--color-surface);
  color: var(--color-on-surface);
  box-shadow: 0 var(--spacing-unit) calc(var(--spacing-unit) * 3) rgba(9, 20, 38, 0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-surface-variant);
    transform: scale(1.1);
  }
}

.details-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-unit) * 1);
  width: 36px;
  height: 36px;
}

// Transition
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>

