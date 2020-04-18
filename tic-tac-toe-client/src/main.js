import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import { store } from '../store'

import User from './components/User.vue'
import Start from './components/Start.vue'
import TicTacToeBoard from './components/TicTacToeBoard.vue'


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
  { path: '/user', component: User },
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


//
// Next Up! @TODO
//
/*

* setup vue router
* user arives - either
  * create new game - Done!
  * join existing - up next
* next, check to see if they are already have user ID in cookies
  * if yes, allow them to reset it
  * if no, get them to create a user

* update game logic to account for different players


*/