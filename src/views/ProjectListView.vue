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
        <b-form-group label="Project State Filter">
          <b-form-checkbox-group
            v-model="stateFilter"
            :options="stateOptions"
          >
          </b-form-checkbox-group>
        </b-form-group>
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
  data() {
    return {
      stateFilter: ['finished', 'planned', 'under construction'],
      stateOptions: [
        { text: 'finished', value: 'finished' },
        { text: 'under construction', value: 'under construction' },
        { text: 'planned', value: 'planned' }
      ]
    }
  },
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
      let filteredList = []
      for ( let i = 0; i < this.projectList.length; i++ ) {
        if ( this.stateFilter.includes(this.projectList[i].state) ) {
          filteredList.push(this.projectList[i])
        }
      }
      return filteredList
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