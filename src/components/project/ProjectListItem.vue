<template>
  <!-- Use router-link if no external link prop, otherwise use a tag -->
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    :href="href"
    :target="target"
    class="project-card-link"
    :class="{ 'external-link': href }"
  >
    <b-card class="project-list-item" no-body>
      <b-row no-gutters class="g-0">
        <!-- Image Section - Left side -->
        <b-col cols="5" class="image-col">
          <b-card-img
            :src="teaserImage"
            :alt="project.name"
            class="project-image"
            placement="top"
          />
          <!-- State badge overlay -->
          <div class="state-badge" :class="project.state?.replace(' ', '-')">
            {{ stateLabel }}
          </div>
        </b-col>
        
        <!-- Content Section - Right side -->
        <b-col cols="7" class="content-col">
          <b-card-body class="project-content">
            <b-card-title class="project-title text-truncate">
              {{ project.name }}
            </b-card-title>
            
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
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import CategoryBadge from "../../components/CategoryBadge.vue";
import CountryLabel from "../../components/CountryLabel.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: { CategoryBadge, CountryLabel },
  setup() {
    const { t } = useI18n();
    return { t };
  },
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
    teaserImage() {
      if (this.project.teaserImg && this.project.teaserImg.length > 0) {
        const img = this.project.teaserImg[0];
        return img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
      } else {
        return "/img/placeholder.png";
      }
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
});
</script>

<style lang="scss">
@use "@/assets/design-tokens.scss" as *;

.project-card-link {
  color: inherit;
  text-decoration: none;
  display: block;
  height: 100%;
  cursor: pointer;

  &.external-link {
    cursor: pointer;
  }
}

.project-list-item {
  height: 100%;
  min-height: 180px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: none !important;
  border-radius: var(--shape-round-xl) !important;
  overflow: hidden;
  box-shadow: 0 var(--spacing-unit) calc(var(--spacing-unit) * 3) rgba(9, 20, 38, 0.08);
  background: var(--color-surface);
  position: relative;

  &:hover {
    transform: translateY(calc(-1 * var(--spacing-unit) * 2));
    box-shadow: 0 calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 6) rgba(9, 20, 38, 0.12);

    .project-image {
      transform: scale(1.05);
    }
  }
}

.image-col {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-radius: var(--shape-round-default);
}

.state-badge {
  position: absolute;
  top: calc(var(--spacing-unit) * 1.5);
  right: calc(var(--spacing-unit) * 1.5);
  padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 1);
  border-radius: var(--shape-round-full);
  font-size: var(--font-size-label-sm);
  font-weight: var(--font-weight-label-md);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  z-index: 1;

  &.finished {
    background: var(--color-tertiary);
    color: var(--color-on-tertiary);
  }

  &.under-construction {
    background: var(--color-secondary);
    color: var(--color-on-secondary);
  }

  &.planned {
    background: var(--color-surface-variant);
    color: var(--color-on-surface-variant);
  }
}

.content-col {
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.project-content {
  padding: calc(var(--spacing-unit) * 2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
  flex: 1;
}

.project-title {
  font-size: var(--font-size-headline-md);
  font-weight: var(--font-weight-headline-md);
  color: var(--color-on-surface);
  margin: 0;
  line-height: var(--line-height-headline-md);
  letter-spacing: var(--letter-spacing-headline-md);
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 0.5);
}

.category-badges {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 0.5);
}

.country-row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.5);
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
}

.country-icon {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
}

.project-actions {
  display: flex;
  gap: calc(var(--spacing-unit) * 1);
  margin-top: auto;
  padding-top: calc(var(--spacing-unit) * 1);
}
</style>
