import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
import VuexPersist from 'vuex-persist';

Vue.use(Vuex);
const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage,
  reducer: state => ({
    gameId: state.gameId,
    userId: state.userId
  })
})

// @TODO this file needs a boatload of sanitization

export const store = new Vuex.Store({
  state : {
    boxes: [],
    gameId: '',
    name: '',
    userId: 'U' + Math.floor(Math.random() * 10000)
  },
  mutations: {
    newGameMut (state, payload) {
      // state
      state.boxes = payload.state.boxes
      state.gameId = payload.id
      state.name = payload.name
    },
    setBoxesMut (state, payload) {
      state.boxes = payload
    },
    setGameId (state, payload) {
      state.gameId = payload
    }
  },
  actions: {
    newGame: async (store, payload) => {
      store.commit('newGameMut', payload)
    },
    checkBox: async (store, payload) => {
      store.commit('setBoxesMut', payload)
    },
    setBoxes: async (store, payload) => {
      let { data } = await Axios.get('http://localhost:5000/set')
      store.commit('setBoxesMut', data);
    }
  },
  plugins: [vuexLocalStorage.plugin]
})