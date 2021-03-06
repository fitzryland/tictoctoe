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

var connectionUrl = 'http://localhost:2345';
if ( process.env.NODE_ENV === 'production' ) {
   connectionUrl = 'https://tictac-fitz-to.herokuapp.com';
}

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
    winner: 'in-play',
    usersLength: 0
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
      state.usersLength = payload.usersLength
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
      let { data } = await Axios.get(connectionUrl + '/set')
      store.commit('setBoxesMut', data);
    }
  },
  plugins: [vuexLocalStorage.plugin]
})