<template>
  <VueSidePanel
    v-if="project"
      v-model="showPanel"
      :overlay-opacity="0"
      z-index="9999"
      side="right"
      :no-close="false"
      lock-scroll
      hide-close-btn

    >
      <template #header>
        <div class="sidepanel__header">
          <span class="close-btn" @click="onSidePanelClose">&#10006;</span>
          <h2>
            <b-img
              v-for="category in project.category"
              v-bind:key="category"
              class="pin"
              :src="getPin(category)" :alt="project?.name" />
            <router-link :to="`/project/${project.id}`">{{ project.name }}</router-link>
          </h2>
          <h3><country-label :country-id="project.country" /></h3>
          <category-badge v-for="category in project.category"
              v-bind:key="category" :category-id="category" />
        </div>
      </template>
      <template #default>
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
        </div>
      </template>

    </VueSidePanel>
</template>

<script>
import { mapState } from "pinia"
import { useCategoryStore } from "@/store/category.store"

import CategoryBadge from '@/components/CategoryBadge.vue'
import CountryLabel from '@/components/CountryLabel.vue'
import MarkdownText from '@/components/MarkdownText.vue'

export default {
    name: "ProjectDetails",
    props: {
      project: {
        type: Object,
        required: false,
        default: null
      },
      isOpened: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
          showPanel: false
      }
    },
    methods: {
        onSidePanelOpen() { },
        onSidePanelClose() {
            this.showPanel = false;
            this.$emit("close");
        },
        getPin(category) {
            return `/pins/${this.getCategoryById(category).name}.png`;
        },
    },
    computed: {
      ...mapState(useCategoryStore, {
        getCategoryById: store => store.getById
      })
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
        }
        else {
          this.$nextTick(() => {
              this.onSidePanelClose();
          });
        }
      }
    },
    components: { CategoryBadge, CountryLabel, MarkdownText }
}
</script>

<style lang="scss">
.sidepanel {
  &__header {
    background-color: rgb(150, 150, 150);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    padding: 20px;

    .pin {
      margin-right: 0.25rem;
    }

    .close-btn {
      position: absolute;
      height: 18px;
      width: 18px;
      top: 1rem;
      right: 1rem;
      padding: 0;
      padding-left: 0.25rem;
      font-weight: 900;
      font-size: 10px;
      cursor: pointer;
      border: rgb(182, 182, 182) solid 1px;
      border-radius: 10%;

      &:hover {
        background-color: rgb(182, 182, 182);
        color: rgb(61, 94, 158);
      }
    }
    a {
      text-decoration: none;
    }
  }

  &__content {
    padding: 20px;

    img {
      max-width: 100%;
      max-width: 340px;
    }
  }
}
</style>
