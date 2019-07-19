// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import JsonExcel from 'vue-json-excel'
import VueQuillEditor from 'vue-quill-editor'
import axios from 'axios'

import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import { store } from './store'
import HelperMixin from './mixins/HelperMixin'

import 'vuetify/dist/vuetify.min.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

const AlertCmp = () => import('./components/Shared/Alert')
const Snackbar = () => import('./components/Shared/Snackbar')
const Terms = () => import('./components/Shared/Terms')
const DuplicateConfirmDialog = () => import('./components/Shared/DuplicateConfirmDialog')
const DeleteConfirmDialog = () => import('./components/Shared/DeleteConfirmDialog')
const ParentSectionDialog = () => import('./components/Shared/ParentSectionDialog')
const FileUpload = () => import('./components/Shared/FileUpload.vue')
const ApplicationLoading = () => import('./components/Shared/ApplicationLoading.vue')
const DateRange = () => import('./components/Shared/DateRange.vue')

window.axios = require('axios')
const sanitizeHtml = require('sanitize-html')

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('token')
    if (accessToken != null) {
      config.headers['API-Token'] = accessToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Currently it seems core plugin requests role and a few other inaccessible resources making the
// password reset broken. This is a temporary fix, a whilelist of routes that don't trigger a
// redirect during a 401
const whitelist401 = [
  'NewPassword',
  'Register',
  'Login'
]

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.status === 401) {
      if (whitelist401.indexOf(router.currentRoute.name) === -1) {
        store.dispatch('logout')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)
Vue.use(Vuetify)
Vue.mixin(HelperMixin)
Vue.use(VueQuillEditor)
Vue.config.productionTip = false
Vue.prototype.$sanitize = sanitizeHtml

Vue.component('app-alert', AlertCmp)
Vue.component('Snackbar', Snackbar)
Vue.component('Terms', Terms)
Vue.component('DeleteConfirmDialog', DeleteConfirmDialog)
Vue.component('DuplicateConfirmDialog', DuplicateConfirmDialog)
Vue.component('ParentSectionDialog', ParentSectionDialog)
Vue.component('FileUpload', FileUpload)
Vue.component('ApplicationLoading', ApplicationLoading)
Vue.component('downloadExcel', JsonExcel)
Vue.component('VDateRange', DateRange)

/* eslint-disable no-new */
function createApp () {
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  })
}

if (sessionStorage.getItem('token')) {
  store.dispatch('autoSignIn').finally(() => createApp())
} else {
  createApp()
}
