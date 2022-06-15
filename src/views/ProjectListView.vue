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
        <b-card-group>
          <project-list-item
            v-for="project in projectList"
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
    })
  }

}
</script>

<style lang="scss" scoped>
.project-list {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
}
</style>