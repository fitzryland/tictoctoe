import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex);

export const store = new Vuex.Store({
  state : {
    boxes: []
  },
  mutations : {
    newGameMut (state, payload) {
      // state
      state.boxes = payload.state.boxes
      state.gameId = payload.id
      state.name = payload.name
    },
    setBoxesMut (state, payload) {
      state.boxes = payload
    }
  },
  actions : {
    newGame: async (context, payload) => {
      context.commit('newGameMut', payload)
    },
    checkBox: async (context, payload) => {
      context.commit('setBoxesMut', payload)
    },
    setBoxes: async (state, payload) => {
      let { data } = await Axios.get('http://localhost:5000/set')
      state.commit('setBoxesMut', data);
    }
  }
})