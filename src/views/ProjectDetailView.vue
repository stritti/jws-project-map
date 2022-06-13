<template>
  <b-container>
    <b-skeleton-wrapper :loading="loading">
      <template #loading>
        <h1><b-skeleton width="75%"></b-skeleton></h1>
        <p>
          <b-skeleton width="85%"></b-skeleton>
          <b-skeleton width="55%"></b-skeleton>
          <b-skeleton width="70%"></b-skeleton>
        </p>
      </template>

      <div v-if="project">
        <h1>{{ project.name }}</h1>
      </div>
      <div v-if="project.teaserImg">
        <b-img
            :src="project.teaserImg[0].thumbnails.large.url"
            :alt="project.name"
            fluid
        />
      </div>
      <markdown-text v-if="project.notes" :text="project.notes" />

      <div v-if="project.link">
        <b-button :href="project.link" variant="primary">
          more &hellip;
        </b-button>
      </div>
    </b-skeleton-wrapper>
  </b-container>
</template>

<script>
import projectService from '@/services/project.service'
import MarkdownText from '@/components/MarkdownText.vue'

export default {
  components: { MarkdownText },
  name: "ProjectDetailsView",
  data () {
    return {
      project: null
    }
  },
  mounted () {
    projectService.getProject(this.$route.params.projectId).then(project => {
      this.project = project
    })
  },
  computed: {
    loading () {
      return !this.project
    }
  }
}
</script>

<style>

</style>