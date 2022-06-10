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
        <div class="map__sidepanel-header">
          <span class="close-btn" @click="onSidePanelClose">&#10006;</span>
          <h2>Project Details </h2>
        </div>
      </template>
      <template #default>
        <div
          class="map__sidepanel-content">
          <h2>
            <img :src="getPin(project)" :alt="project?.type"/>
            {{ project.name }} <sup><type-badge :type="project?.type" /></sup>
          </h2>
          <hr />

          <div v-if="project.teaserImg">
            <img
              class="teaser-img"
              :src="project.teaserImg[0].thumbnails.large.url" />
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
        <div class="map__sidepanel-footer">
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
