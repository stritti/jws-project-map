<template>
  <!--
    router-link  in-app navigation (normal mode)
    <a target="_blank">  new tab when embedded in an iframe
    <div>  static card (no navigation)
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
    @keydown.enter="onCardClick"
    @keydown.space.prevent="onCardClick"
    role="link"
    :aria-label="cardAriaLabel"
    tabindex="0"
  >
      <div class="project-list-item" role="article" :aria-label="cardAriaLabel">
      <div class="flex">
        <!-- Image Section - Left side -->
        <div class="w-5/12 image-col">
          <img
            :src="teaserImage"
            :alt="project.name"
            class="project-image" 
            loading="lazy"
          />
          <!-- State badge overlay -->
          <div class="state-badge-overlay">
            <StateBadge :state="project.state" />
          </div>
        </div>
        
        <!-- Content Section - Right side -->
        <div class="w-7/12 content-col">
          <div class="project-content">
            <h3 class="project-title text-truncate" :aria-label="project.name">
              {{ project.name }}
            </h3>
            
            <div class="project-meta" role="contentinfo">
              <!-- Category badges -->
              <div class="category-badges" role="list" :aria-label="t('a11y.categoriesFilter')">
                <category-badge
                  v-for="category in project.category"
                  :key="category.id"
                  :category-id="category.id"
                  role="listitem"
                />
              </div>
              
              <!-- Country -->
              <div v-if="project.country && project.country.id" class="country-row" role="contentinfo">
                <IBiGeoAlt class="country-icon" aria-hidden="true" />
                <country-label :country-id="project.country.id" />
              </div>
            </div>
            
            <!-- Optional actions slot (for map overlay) -->
            <div v-if="$slots.actions" class="project-actions" role="group">
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
