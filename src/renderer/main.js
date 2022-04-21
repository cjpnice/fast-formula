import Vue from 'vue'

import App from './App'
import router from './router'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'font-awesome/css/font-awesome.min.css';
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// use
Vue.use(mavonEditor)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
