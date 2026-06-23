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
          <div class="state-badge" :class="project.state?.replace(' ', '-')">
            {{ stateLabel }}
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

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useWebFrame } from "@/composables/useWebFrame";
import CategoryBadge from "../../components/CategoryBadge.vue";
import CountryLabel from "../../components/CountryLabel.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: { CategoryBadge, CountryLabel },
  setup() {
    const { t } = useI18n();
    const { isIFrame, notifyNavigate } = useWebFrame();
    const router = useRouter();
    return { t, isIFrame, notifyNavigate, router };
  },
  emits: ['click'],
  props: {
    project: {
      type: Object,
      required: true,
    },
    // Optional props for external links
    to: {
      type: String,
      default: null,
    },
    href: {
      type: String,
      default: null,
    },
    target: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    // In iframe mode: render as <a href="..." target="_blank">
    // so the project detail opens in a new browser tab.
    resolvedComponent() {
      if (this.href) return 'a';
      if (this.to && this.isIFrame) return 'a';
      if (this.to) return 'router-link';
      return 'div';
    },
    resolvedTo() {
      return this.to && !this.isIFrame ? this.to : null;
    },
    resolvedHref() {
      if (this.href) return this.href;
      if (this.to && this.isIFrame) {
        return this.router.resolve(this.to, this.$route).href;
      }
      return null;
    },
    resolvedTarget() {
      if (this.href) return '_blank';
      if (this.to && this.isIFrame) return '_blank';
      return undefined;
    },
    resolvedRel() {
      if (this.resolvedTarget === '_blank') return 'noopener noreferrer';
      return undefined;
    },
    teaserImage() {
      if (this.project.teaserImg && this.project.teaserImg.length > 0) {
        const img = this.project.teaserImg[0];
        return img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
      } else {
        return "/img/placeholder.png";
      }
    },
    cardAriaLabel() {
      const parts = [this.project.name];
      if (this.stateLabel) parts.push(this.stateLabel);
      if (this.project.country && this.project.country.fields?.Name) {
        parts.push(this.project.country.fields.Name);
      }
      return parts.join(", ");
    },
    stateLabel() {
      const labels: Record<string, string> = {
        finished: this.$t("project.state.finished"),
        "under construction": this.$t("project.state.underConstruction"),
        planned: this.$t("project.state.planned"),
      };
      return labels[this.project.state] || this.project.state;
    },
  },
  methods: {
    onCardClick() {
      // In iframe mode: notify the parent frame about the navigation
      if (this.isIFrame && this.to && this.project) {
        this.notifyNavigate(this.to, this.project.id);
      }
      this.$emit('click');
    },
  },
});
</script>

<style lang="postcss">
.project-card-link {
  @apply block h-full cursor-pointer text-inherit no-underline;

  &.external-link {
    @apply cursor-pointer;
  }
}

.project-list-item {
  @apply h-full min-h-[180px] transition-all duration-[400ms] ease-[cubic-bezier(0.165,0.84,0.44,1)] border-none rounded-round-xl overflow-hidden shadow-[0_var(--spacing-unit)_calc(var(--spacing-unit)*3)_rgba(9,20,38,0.08)] bg-surface relative;

  &:hover {
    @apply -translate-y-[calc(var(--spacing-unit)*2)] shadow-[0_calc(var(--spacing-unit)*2)_calc(var(--spacing-unit)*6)_rgba(9,20,38,0.12)];

    .project-image {
      @apply scale-105;
    }
  }
}

.image-col {
  @apply relative overflow-hidden aspect-square;
}

.project-image {
  @apply w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.165,0.84,0.44,1)] rounded-round-default;
}

.state-badge {
  @apply absolute top-[calc(var(--spacing-unit)*1.5)] right-[calc(var(--spacing-unit)*1.5)] px-[calc(var(--spacing-unit)*1)] py-[calc(var(--spacing-unit)*0.5)] rounded-full text-label-sm  uppercase tracking-[0.02em] z-0;

  &.finished {
    @apply bg-surface-variant text-on-tertiary;
  }

  &.under-construction {
    @apply bg-secondary text-white;
  }

  &.planned {
    @apply bg-surface-variant text-on-surface-variant;
  }
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
