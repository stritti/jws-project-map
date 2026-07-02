<template>
  <!--
    router-link → in-app navigation (normal mode)
    <a target="_blank"> → new tab when embedded in an iframe
    <div> → static card (no navigation)
  -->
  <component
    :is="resolvedComponent"
    :to="resolvedTo"
    :href="resolvedHref"
    :target="resolvedTarget"
    :rel="resolvedRel"
    class="project-card-link"
    :class="{ 'external-link': href || (to && isIFrame) }"
    @click="onCardClick"
  >
      <div class="project-list-item" :aria-label="cardAriaLabel">
      <div class="flex">
        <!-- Image Section - Left side -->
        <div class="w-5/12 image-col">
          <img
            :src="teaserImage"
            :alt="project.name"
            class="project-image"
          />
          <!-- State badge overlay -->
          <div class="state-badge-overlay">
            <StateBadge :state="project.state" />
          </div>
        </div>
        
        <!-- Content Section - Right side -->
        <div class="w-7/12 content-col">
          <div class="project-content">
            <h3 class="project-title text-truncate">
              {{ project.name }}
            </h3>
            
            <div class="project-meta">
              <!-- Category badges -->
              <div class="category-badges">
                <category-badge
                  v-for="category in project.category"
                  :key="category.id"
                  :category-id="category.id"
                />
              </div>
              
              <!-- Country -->
              <div v-if="project.country && project.country.id" class="country-row">
                <IBiGeoAlt class="country-icon" />
                <country-label :country-id="project.country.id" />
              </div>
            </div>
            
            <!-- Optional actions slot (for map overlay) -->
            <div v-if="$slots.actions" class="project-actions">
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useWebFrame } from "@/composables/useWebFrame";
import type { Project } from "@/interfaces/Project";
import CategoryBadge from "../CategoryBadge.vue";
import CountryLabel from "../CountryLabel.vue";
import StateBadge from "@/components/StateBadge.vue";

const { t } = useI18n();
const { isIFrame, notifyNavigate } = useWebFrame();
const router = useRouter();
const route = useRoute();

const props = withDefaults(defineProps<{
  project: Project;
  to?: string | null;
  href?: string | null;
  target?: string;
}>(), {
  to: null,
  href: null,
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const teaserImage = computed(() => {
  if (props.project.teaserImg && props.project.teaserImg.length > 0) {
    const img = props.project.teaserImg[0];
    return img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
  } else {
    return "/img/placeholder.png";
  }
});

const stateLabels: Record<string, string> = {
  finished: t("project.state.finished"),
  "under construction": t("project.state.underConstruction"),
  planned: t("project.state.planned"),
};

const cardAriaLabel = computed(() => {
  const parts = [props.project.name];
  const sl = stateLabels[props.project.state];
  if (sl) parts.push(sl);
  if (props.project.country) {
    parts.push(props.project.country.fields.Name);
  }
  return parts.join(", ");
});

// In iframe mode: render as <a href="..." target="_blank">
// so the project detail opens in a new browser tab.
const resolvedComponent = computed(() => {
  if (props.href) return 'a';
  if (props.to && isIFrame.value) return 'a';
  if (props.to) return 'router-link';
  return 'div';
});

const resolvedTo = computed(() => {
  return props.to && !isIFrame.value ? props.to : null;
});

const resolvedHref = computed(() => {
  if (props.href) return props.href;
  if (props.to && isIFrame.value) {
    return router.resolve(props.to, route).href;
  }
  return null;
});

const resolvedTarget = computed(() => {
  if (props.href) return '_blank';
  if (props.to && isIFrame.value) return '_blank';
  return undefined;
});

const resolvedRel = computed(() => {
  if (resolvedTarget.value === '_blank') return 'noopener noreferrer';
  return undefined;
});

function onCardClick() {
  // In iframe mode: notify the parent frame about the navigation
  if (isIFrame.value && props.to && props.project) {
    notifyNavigate(props.to, props.project.id);
  }
  emit('click');
}
</script>

<style lang="postcss">
.project-card-link {
  @apply block h-full cursor-pointer text-inherit no-underline;

  &.external-link {
    @apply cursor-pointer;
  }
}

.project-list-item {
  @apply h-full min-h-[180px] transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.165,0.84,0.44,1)] border-none rounded-round-xl overflow-hidden shadow-[0_var(--spacing-unit)_calc(var(--spacing-unit)*3)_rgba(9,20,38,0.08)] bg-surface relative;

  &:hover {
    @apply -translate-y-[calc(var(--spacing-unit)*2)] shadow-[0_calc(var(--spacing-unit)*2)_calc(var(--spacing-unit)*6)_rgba(9,20,38,0.12)];

    .project-image {
      @apply scale-105;
    }
  }
}

.image-col {
  @apply relative overflow-hidden aspect-[4/3];
}

.project-image {
  @apply w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.165,0.84,0.44,1)] rounded-round-default;
}

.state-badge-overlay {
  @apply absolute top-[calc(var(--spacing-unit)*1.5)] right-[calc(var(--spacing-unit)*1.5)] z-[1];
}

.content-col {
  @apply flex flex-col min-h-[180px];
}

.project-content {
  @apply p-[calc(var(--spacing-unit)*2)] flex flex-col gap-[calc(var(--spacing-unit)*0.5)] flex-1;
}

.project-title {
  @apply text-headline-md  text-onSurface m-0 leading-headline-md tracking-headline-md;
}

.project-meta {
  @apply flex flex-col gap-[calc(var(--spacing-unit)*0.5)];
}

.category-badges {
  @apply flex flex-wrap gap-[calc(var(--spacing-unit)*0.5)];
}

.country-row {
  @apply flex items-center gap-[calc(var(--spacing-unit)*0.5)] text-body-md text-onSurface-variant;
}

.country-icon {
  @apply text-body-md text-onSurface-variant;
}

.project-actions {
  @apply flex gap-[calc(var(--spacing-unit)*1)] mt-auto pt-[calc(var(--spacing-unit)*1)];
}
</style>
