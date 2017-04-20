import Vue from 'vue'
import Vuikit from 'vuikit'
import App from './App.vue'

Vue.use(Vuikit)
Vue.use(require('vue-moment'))

new Vue({
  el: '#app',
  render: h => h(App)
})
