<template>
  <BOffcanvas
    v-if="project"
    class="sidepanel"
    header-class="sidepanel__header"
    placement="end"
    v-model="showPanel"
  >
    <template #title>
      <h2>
        <b-img
          v-for="category in (Array.isArray(project.category) ? project.category : [project.category])"
          :key="category"
          class="pin"
          :src="getPin(category)"
          :alt="project?.name"
        />
        <router-link :to="`/project/${project.id}`">{{
          project.name
        }}</router-link>
      </h2>
    </template>

    <div class="sidepanel__content">
      <h3><country-label :country-id="project.country" /></h3>
      <div>
        <category-badge
          v-for="category in project.category"
          :key="category"
          :category-id="category"
        />
      </div>

      <b-img
        v-if="project.teaserImg"
        :src="project.teaserImg[0].signedUrl"
        :alt="project.name"
        fluid
      />

      <p><em>Project State:</em> {{ project.state }}</p>

      <markdown-text :text="project.notes" />

      <div class="sidepanel__footer">
        <b-button :to="`/project/${project.id}`" variant="primary">
          More &hellip;
        </b-button>
        <navigate-button
          class="navigate-btn"
          :lat="project.latitude"
          :lng="project.longitude"
        />
      </div>
    </div>
  </BOffcanvas>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useCategoryStore } from "../../stores/category.store";

import CategoryBadge from "../../components/CategoryBadge.vue";
import CountryLabel from "../../components/CountryLabel.vue";
import MarkdownText from "../../components/MarkdownText.vue";
import NavigateButton from "../../components/actions/NavigateButton.vue";
import type { Project } from "../../interfaces/Project";

export default defineComponent({
  name: "ProjectDetails",
  components: { CategoryBadge, CountryLabel, MarkdownText, NavigateButton },
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
  data() {
    return {
      showPanel: false as boolean,
    };
  },
  computed: {
    ...mapState(useCategoryStore, {
      getCategoryById: (store) => store.getById,
    }),
  },
  watch: {
    isOpened(val) {
      this.showPanel = val;
    },
    showPanel(val) {
      if (val) {
        this.$nextTick(() => {
          this.onSidePanelOpen();
        });
      } else {
        this.$nextTick(() => {
          this.onSidePanelClose();
        });
      }
    },
  },
  methods: {
    onSidePanelOpen() {},
    onSidePanelClose() {
      this.showPanel = false;
      this.$emit("close");
    },
    getPin(categoryId: string | number) {
      const category = this.getCategoryById(categoryId);
      if (category) {
        return `/pins/${category.name.toLowerCase()}.png`;
      } else {
        return "/pins/unknown.png";
      }
    },
  },
});
</script>

<style lang="scss">
.sidepanel {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);

  &__header {
    text-transform: uppercase;

    background-color: var(--bs-secondary);
    border-bottom: 1px solid var(--bs-secondary-text-emphasis);

    .pin {
      margin-right: 0.25rem;
    }

    a {
      color: var(--bs-secondary-bg-subtle);
      text-decoration: none;
    }
  }

  &__content {
    img {
      max-width: 100%;
      max-height: 50vh;
    }
    .share-btn {
      margin-left: 0.5rem;
    }
    .navigate-btn {
      margin-left: 0.5rem;
    }
  }

  &__footer {
    width: 100%;
    padding-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
  }
}
</style>
