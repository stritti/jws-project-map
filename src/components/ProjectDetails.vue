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
          <h2>Project Details </h2>
        </div>
      </template>
      <template #default>
        <div
          class="sidepanel__content">
          <h2>
            <b-img :src="getPin(project)" :alt="project?.type" />
            {{ project.name }} <sup><type-badge :type="project?.type" /></sup>
          </h2>
          <hr />

          <div v-if="project.teaserImg">
            <b-img
              :src="project.teaserImg[0].thumbnails.large.url"
              :alt="project.name"
              fluid
            />
          </div>
          <p v-if="project.notes"
            v-html="project.notes"></p>
          <div v-if="project.link">
            <b-button :href="project.link" variant="primary">
              more &hellip;
            </b-button>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="sidepanel__footer">
          <p>
            <strong><a href="https://www.joerg-wolff-stiftung.de/">Jörg Wolff Stiftung</a></strong>,
            Kölner Straße 8, 70376 Stuttgart, Germany
          </p>
          <p>
            Tel. +49 (0) 711/540 04-10,
            <a href="mailto:info@joerg-wolff-stiftung.de">info@joerg-wolff-stiftung.de</a>
          </p>
        </div>
      </template>
    </VueSidePanel>
</template>

<script>
import projectService from '@/services/project.service'
import TypeBadge from './TypeBadge.vue'

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
        };
    },
    methods: {
        onSidePanelOpen() { },
        onSidePanelClose() {
            this.showPanel = false;
            this.$emit("close");
        },
        getPin(location) {
            return projectService.getLocationTypeImage(location);
        },
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
    components: { TypeBadge }
}
</script>

<style lang="scss">
.sidepanel {
  &__header {
    background-color: rgb(61, 94, 158);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    padding: 20px;

    .close-btn {
      position: absolute;
      height: 18px;
      width: 18px;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem;
      font-weight: 900;
      font-size: 10px;
      cursor: pointer;
      border: #fff solid 1px;
      border-radius: 10%;

      &:hover {
        background-color: #fff;
        color: rgb(61, 94, 158);
      }
    }
  }

  &__content {
    padding: 20px;

    img {
      max-width: 100%;
    }
  }

  &__footer {
    margin: 0;
    padding: 1rem;
    background-color: #000;
    color: #fff;
    p  {
      font-size: 12px;
    }
    a {
      background-color: #000;
      color: #fff;
      text-decoration: none;
    }
  }
}
</style>
