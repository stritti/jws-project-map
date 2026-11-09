<template>
  <!--
    Compact project card for search suggestion lists, modelled on the map pin
    preview (ProjectDetails/ProjectListItem): image left with the state badge
    overlaid, title and meta (categories + country) right. Emits `select`.
  -->
  <button
    type="button"
    class="project-search-result"
    role="option"
    :aria-label="ariaLabel"
    @click="emit('select', project)"
  >
    <div class="result-image-col">
      <img
        :src="imageUrl"
        :alt="project.name"
        class="result-image"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
      <div class="result-state-overlay">
        <StateBadge :state="project.state" />
      </div>
    </div>

    <div class="result-content">
      <div class="result-title text-truncate">{{ project.name }}</div>
      <div class="result-meta">
        <CategoryBadge
          v-for="category in project.category"
          :key="category.id"
          :category-id="category.id"
        />
        <CountryLabel
          v-if="project.country && project.country.id"
          :country-id="project.country.id"
          compact
        />
      </div>
    </div>

    <IBiChevronRight class="result-chevron" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Project } from "@/interfaces/Project";
import StateBadge from "@/components/StateBadge.vue";
import CategoryBadge from "@/components/CategoryBadge.vue";
import CountryLabel from "@/components/CountryLabel.vue";
import { PLACEHOLDER_IMAGE, teaserImageUrl } from "@/utils/image";
import { stateLabelKey } from "@/constants/projectStates";

import IBiChevronRight from "~icons/bi/chevron-right";

const { t } = useI18n();

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  (e: "select", project: Project): void;
}>();

const imageFailed = ref(false);

// Small thumbnail keeps the suggestion list light; the card_cover variant is
// used by the full-size cards (ProjectListItem).
const imageUrl = computed(() =>
  imageFailed.value ? PLACEHOLDER_IMAGE : teaserImageUrl(props.project, "small"),
);

watch(
  () => props.project.id,
  () => {
    imageFailed.value = false;
  },
);

function onImageError(): void {
  imageFailed.value = true;
}

const ariaLabel = computed(() => {
  const parts = [props.project.name];
  const stateKey = stateLabelKey(props.project.state);
  if (stateKey) parts.push(t(`project.state.${stateKey}`));
  if (props.project.country) {
    parts.push(props.project.country.fields.Name);
  }
  parts.push(t("a11y.viewProjectDetails"));
  return parts.join(", ");
});
</script>

<style lang="postcss" scoped>
@reference "../../assets/main.css";

.project-search-result {
  @apply flex items-center gap-[calc(var(--spacing-unit)*2)] w-full px-[calc(var(--spacing-unit)*3)] py-[calc(var(--spacing-unit)*2)] border-none bg-surface text-left cursor-pointer transition-colors duration-150 hover:bg-surface-variant focus:outline-2 focus:outline-secondary focus:outline-offset-[-2px];
}

.result-image-col {
  @apply relative w-[calc(var(--spacing-unit)*26)] flex-shrink-0;
}

.result-image {
  @apply w-full aspect-[4/3] object-cover object-center rounded-round-default bg-surface-variant;
}

.result-state-overlay {
  @apply absolute top-[calc(var(--spacing-unit)*1)] right-[calc(var(--spacing-unit)*1)] z-[1];
}

.result-content {
  @apply flex-1 min-w-0 flex flex-col gap-[calc(var(--spacing-unit)*0.5)];
}

.result-title {
  @apply text-body-md font-semibold text-onSurface m-0;
}

.result-meta {
  @apply flex flex-wrap items-center gap-x-[calc(var(--spacing-unit)*1)] gap-y-[calc(var(--spacing-unit)*0.5)];
}

.result-chevron {
  @apply flex-shrink-0 text-onSurface-variant self-center;
}
</style>
