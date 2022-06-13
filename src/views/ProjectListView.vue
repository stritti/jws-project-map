<template>
  <b-container>
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
  </b-container>
</template>

<script>
import projectService from '@/services/project.service'
import ProjectListItem from '@/components/project/ProjectListItem.vue'

export default {
  components: { ProjectListItem },
  name: "ProjectDetailsView",
  data () {
    return {
      loading: false,
      projectList: []
    }
  },
  mounted () {
    this.loading = true
    projectService.getLocations().then(projects => {
      this.projectList = projects
      this.loading = false
    })
  }
}
</script>

<style>

</style>