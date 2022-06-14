import { createApp } from 'vue'
import BootstrapVue3 from 'bootstrap-vue-3'

import VueSidePanel from 'vue3-side-panel'
import 'vue3-side-panel/dist/vue3-side-panel.css'

import VuePictureSwipe from 'vue3-picture-swipe';

import App from './App.vue'
import router from './router'

import '@/assets/style-config.scss'

import { createPinia } from 'pinia'
import { useCountryStore } from '@/store/country.store'
import { useCategoryStore } from '@/store/category.store'
import { useProjectStore } from '@/store/project.store'

const app = createApp(App).use(createPinia()).use(router)

app.use(BootstrapVue3)
app.use(VueSidePanel)

app.component('vue-picture-swipe', VuePictureSwipe);

const projectStore = useProjectStore()
projectStore.init()

const countryStore = useCountryStore()
countryStore.init()

const categoryStore = useCategoryStore()
categoryStore.init()

app.mount('#app')