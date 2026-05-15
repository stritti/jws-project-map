<template>
  <Transition name="slide-up">
    <div v-if="project && isOpened" class="project-card-overlay">
      <div class="project-card-container">
        <!-- Close button -->
        <button class="close-btn" @click="onClose" aria-label="Schließen">
          <IBiX />
        </button>
        
        <!-- Use ProjectListItem with actions slot -->
        <project-list-item :project="project">
          <template #actions>
            <b-button :to="`/project/${project.id}`" variant="primary" size="sm" class="details-btn">
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
import ProjectListItem from "./ProjectListItem.vue";
import type { Project } from "../../interfaces/Project";

export default defineComponent({
  name: "ProjectDetails",
  components: { ProjectListItem },
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
  },
});
</script>

<style lang="scss">
@use "@/assets/design-tokens.scss" as *;

// Bottom navigation height
$bottom-nav-height: 56px;

.project-card-overlay {
  position: fixed;
  bottom: calc($bottom-nav-height + calc(var(--spacing-unit) * 3));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
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

