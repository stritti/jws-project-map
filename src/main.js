import { createApp } from 'vue'
import App from './App.vue'

import VueSidePanel from 'vue3-side-panel'
import 'vue3-side-panel/dist/vue3-side-panel.css'

import router from './router'


const app = createApp(App).use(router)

app.use(VueSidePanel)

app.mount('#app')