<template>
  <vue-side-panel
    v-if="project"
    v-model="showPanel"
    :overlay-opacity="0.5"
    z-index="9999"
    side="right"
    :no-close="false"
  >
    <template #default>
      <div class="sidepanel__header">
        <h2>
          <b-img
            v-for="category in project.category"
            :key="category"
            class="pin"
            :src="getPin(category)"
            :alt="project?.name"
          />
          <router-link :to="`/project/${project.id}`">{{
            project.name
          }}</router-link>
        </h2>
        <h3><country-label :country-id="project.country" /></h3>
        <category-badge
          v-for="category in project.category"
          :key="category"
          :category-id="category"
        />
      </div>
      <div class="sidepanel__content">
        <div v-if="project.teaserImg">
          <b-img
            :src="project.teaserImg[0].thumbnails.large.url"
            :alt="project.name"
            fluid
          />
        </div>
        <p>Project State: {{ project.state }}</p>
        <markdown-text :text="project.notes" />
        <b-button :to="`/project/${project.id}`" variant="primary">
          Project page &hellip;
        </b-button>
        <navigate-button
          class="navigate-btn"
          :lat="project.latitude"
          :lng="project.longitude"
        />
      </div>
    </template>
  </vue-side-panel>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { useCategoryStore } from "../../stores/category.store";

import CategoryBadge from "../../components/CategoryBadge.vue";
import CountryLabel from "../../components/CountryLabel.vue";
import MarkdownText from "../../components/MarkdownText.vue";
import NavigateButton from "../../components/actions/NavigateButton.vue";

export default defineComponent({
  name: "ProjectDetails",
  components: { CategoryBadge, CountryLabel, MarkdownText, NavigateButton },
  props: {
    project: {
      type: Object
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
    getPin(categoryId: string) {
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
  max-width: 85%;
  &__header {
    background-color: rgb(150, 150, 150);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    padding: 20px;

    .pin {
      margin-right: 0.25rem;
    }

    a {
      text-decoration: none;
    }
  }

  &__content {
    padding: 20px;

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
}
</style>
