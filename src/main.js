import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'
import { store } from '../store'

import Start from './components/Start.vue'
import TicTacToeBoard from './components/TicTacToeBoard.vue'

import 'normalize.css'

import WebFont from'webfontloader'

WebFont.load({
  google: {
    families: ['Raleway:wght@400;600']
  }
});

Vue.use(VueRouter)
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:5000',
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))
Vue.use(require('vue-moment'))
Vue.config.productionTip = false

const routes = [
  { path: '/', component: Start },
  { path: '/tic-tac-toe', component: TicTacToeBoard }
]
const router = new VueRouter({
  routes,
  mode: 'history'
})
const waitForStorageToBeReady = async (to, from, next) => {
  await store.restored
  next()
}
router.beforeEach(waitForStorageToBeReady)

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
}).$mount('#app')