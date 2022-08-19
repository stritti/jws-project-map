<template>
  <b-container>
    <div class="project-list">
      <h1>JWF + Humanaktiv: Project Overview</h1>

      <b-skeleton-wrapper :loading="loading > 0">
        <template #loading>
          <h3><b-skeleton width="75%"></b-skeleton></h3>
          <p>
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </p>
        </template>

        <h3 class="my-3">
          Projects: {{ projectCount }}
          (including: {{ projectsUnderConstruction.length }} under construction,
          {{ projectsPlanned.length }} planned)
        </h3>

        <b-button v-b-toggle.collapse-filter variant="primary">
          <bootstrap-icon icon="filter"/>
          Filter
        </b-button>
        <b-collapse id="collapse-filter">
          <b-card bg-variant="light" class="mb-5">
            <b-form-group label="Project State:">
              <b-form-checkbox-group
                name="stateFilter"
                v-model="stateFilter"
                :options="stateOptions"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <b-form-group label="Project Category:">
              <b-form-checkbox-group
                v-model="categoryFilter"
                :options="categoryList"
                text-field="name"
                value-field="id"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <b-form-group label="Country:">
              <b-form-checkbox-group
                v-model="countryFilter"
                :options="countryList"
                text-field="name"
                value-field="id"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <h3 class="mt-3">
              {{ filteredProjectList.length }} filtered Projects
            </h3>
          </b-card>
        </b-collapse>
      </b-skeleton-wrapper>

      <b-card-group columns class="my-3">
        <project-list-item
          v-for="project in filteredProjectList"
          v-bind:key="project.id"
          :project="project"
        />
      </b-card-group>
    </div>
  </b-container>
  <site-footer />
</template>

<script>
import { mapState } from 'pinia'
import { useLoadingStore } from '@/store/loading.store'
import { useProjectStore } from '@/store/project.store'
import { useCategoryStore } from '@/store/category.store'
import { useCountryStore } from '@/store/country.store'

import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'
import ProjectListItem from '@/components/project/ProjectListItem.vue'
import SiteFooter from '@/components/SiteFooter.vue'

export default {
  components: { BootstrapIcon, ProjectListItem, SiteFooter },
  name: "ProjectDetailsView",
  data() {
    return {
      stateFilter: ['finished', 'planned', 'under construction'],
      stateOptions: [
        { text: 'finished', value: 'finished' },
        { text: 'under construction', value: 'under construction' },
        { text: 'planned', value: 'planned' }
      ],
      categoryFilter: [],
      countryFilter: [],
    }
  },
  computed: {
    ...mapState( useLoadingStore, {
      loading: 'loading'
    }),
    ...mapState( useProjectStore, {
      projectList: 'projects'
    }),
    ...mapState( useCategoryStore, {
      categoryList: 'categories'
    }),
    ...mapState( useCountryStore, {
      countryList: 'countries'
    }),
    filteredProjectList () {
      const loadingStore = useLoadingStore()
      loadingStore.updateLoading(true)
      const filteredList = []

      for ( let i = 0; i < this.projectList.length; i++ ) {
        const project = this.projectList[i]
        if (
          (this.stateFilter.length === 0 || this.stateFilter.includes(project.state)) &&
          (this.categoryFilter.length === 0 || this.categoryFilter.some(r => project.category.includes(r))) &&
          (this.countryFilter.length === 0 || this.countryFilter.includes(project.country[0]))
        ) {
          filteredList.push(project)
        }
      }

      loadingStore.updateLoading(false)
      return filteredList
    },
    projectCount () {
      return this.projectList.length
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