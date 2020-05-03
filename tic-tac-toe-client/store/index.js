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
    userId: state.userId,
    userName: state.userName
  })
})

// @TODO this file needs a boatload of sanitization

export const store = new Vuex.Store({
  state : {
    boxes: [],
    gameId: '',
    name: '',
    userId: 'U' + Math.floor(Math.random() * 10000),
    userName: '',
    isTurn: false,
    team: false,
    isObserver: true,
    winner: 'in-play'
  },
  mutations: {
    updateGameMut (state, payload) {
      state.boxes = payload.boxes
      state.gameId = payload.id
      state.name = payload.name
      state.isTurn = payload.isTurn
      state.team = payload.team
      state.isObserver = payload.isObserver
      state.winner = payload.winner
    },
    setBoxesMut (state, payload) {
      state.boxes = payload.state.boxes
    },
    setGameId (state, payload) {
      state.gameId = payload
    },
    setUserName (state, payload) {
      state.userName = payload
    }
  },
  actions: {
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