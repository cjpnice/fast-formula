import Vue from 'vue'

import App from './App'
import router from './router'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'font-awesome/css/font-awesome.min.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
import VueClipboard from 'vue-clipboard2'
import db from './datastore'
Vue.config.productionTip = false
Vue.use(VueClipboard)


Vue.prototype.$db = db
// use
Vue.use(mavonEditor)
Vue.use(ElementUI)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
