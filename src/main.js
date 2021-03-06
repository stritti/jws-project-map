import { createApp } from 'vue'
import BootstrapVue3 from 'bootstrap-vue-3'

import VueSidePanel from 'vue3-side-panel'
import 'vue3-side-panel/dist/vue3-side-panel.css'

import VuePictureSwipe from 'vue3-picture-swipe'

import Vue3VideoPlayer from '@cloudgeek/vue3-video-player'
import '@cloudgeek/vue3-video-player/dist/vue3-video-player.css'

import App from './App.vue'
import router from './router'

import '@/assets/style-config.scss'

import { createPinia } from 'pinia'
import { useCountryStore } from '@/store/country.store'
import { useCategoryStore } from '@/store/category.store'
import { useProjectStore } from '@/store/project.store'


const pinia = createPinia()


const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(BootstrapVue3)
app.use(VueSidePanel)
app.use(Vue3VideoPlayer, {
    lang: 'en'
  })

app.component('vue-picture-swipe', VuePictureSwipe)

const projectStore = useProjectStore()
projectStore.init()

const countryStore = useCountryStore()
countryStore.init()

const categoryStore = useCategoryStore()
categoryStore.init()


app.mount('#app')