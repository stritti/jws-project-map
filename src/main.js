import { createApp } from 'vue'
import BootstrapVue3 from 'bootstrap-vue-3'

import VueSidePanel from 'vue3-side-panel'
import 'vue3-side-panel/dist/vue3-side-panel.css'

import App from './App.vue'
import router from './router'

import '@/assets/style-config.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import { createPinia } from 'pinia'

const app = createApp(App).use(createPinia()).use(router)

app.use(BootstrapVue3)
app.use(VueSidePanel)

app.mount('#app')