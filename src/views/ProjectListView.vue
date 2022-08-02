<template>
  <b-container>
    <div class="project-list">
      <h1>Project Overview</h1>

      <b-skeleton-wrapper :loading="loading">
        <template #loading>
          <h1><b-skeleton width="75%"></b-skeleton></h1>
          <p>
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </p>
        </template>
        <p>
          Projects: {{ projectCount }}
          (including: {{ projectsUnderConstruction.length }} under construction,
          {{ projectsPlanned.length }} planned)
        </p>
        <b-card-group>
          <project-list-item
            v-for="project in filteredProjectList"
            v-bind:key="project.id"
            :project="project"
          />
        </b-card-group>
      </b-skeleton-wrapper>
    </div>
  </b-container>
  <site-footer />
</template>

<script>
import { mapState } from 'pinia'
import { useLoadingStore } from '@/store/loading.store'
import { useProjectStore } from '@/store/project.store'

import ProjectListItem from '@/components/project/ProjectListItem.vue'
import SiteFooter from '@/components/SiteFooter.vue'

export default {
  components: { ProjectListItem, SiteFooter },
  name: "ProjectDetailsView",

  computed: {
    ...mapState( useLoadingStore, {
      loading: 'showLoadingSpinner'
    }),
    ...mapState( useProjectStore, {
      projectList: 'projects'
    }),
    projectCount () {
      return this.projectList.length
    },
    filteredProjectList () {
      return this.projectList.filter(project => {
        return project.state === 'finished' || project.state === 'under construction' || project.state === 'planned'
      })
    },
    projectsFinished () {
      if (this.projectList.length > 0) {
        return this.projectList.filter(loc => loc.state === 'finished')
      } else {
        return []
      }
    },
    projectsUnderConstruction () {
      if (this.projectList.length > 0) {
        return this.projectList.filter(loc => loc.state === 'under construction')
      } else {
        return []
      }
    },
    projectsPlanned () {
      if (this.projectList.length > 0) {
        return this.projectList.filter(loc => loc.state === 'planned')
      } else {
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.project-list {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
}
</style>