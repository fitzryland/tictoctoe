<template>
  <div class="tic_tac_toe">
    <header class="header">
      <User />
      <SessionActions />
    </header>
    <div class="board">
      <button
        v-for="box in boxes"
        v-bind:key="box['id']"
        v-on:click="clickBox"
        v-bind:data-id=box.id
        class="cell"
        v-bind:class="{ active: box.checked }"
      >
      </button>
    </div>
  </div>
</template>
<script>
  import VueSocketIO from 'vue-socket.io'
  import User from './User.vue'
  import SessionActions from './SessionActions.vue'
  export default {
    name: 'TicTacToeBoard',
    components: {
      User,
      SessionActions
    },
    data() {
      return {
        isConnected: false,
        socketMessage: '',
        hideShare: true
      }
    },
    computed: {
      boxes() {
        let boxes = this.$store.state.boxes
        return boxes
      },
      gameId() {
        let gameId = this.$store.state.gameId
        return gameId
      }
    },
    async mounted () {
      this.registerUser()
      let gameId = this.$store.state.gameId
      if ( gameId ) {
        this.joinGame(gameId);
      } else {
        this.newGame();
      }
    },
    sockets: {
      connect () {
        console.log('socket connected')
        this.isConnected = true;
      },
      disconnect () {
        console.log('socket disconnected')
        this.isConnected = false;
      },
      newGame (data) {
        this.$store.commit('newGame', data)
      },
      setBoxes (data) {
        this.$store.dispatch('checkBox', data)
      },
      updateGame (data) {
        if ( data.status ) {
          // update the state
          this.$store.commit('newGame', data)
        } else {
          // @TODO display error
        }
      }
    },
    methods: {
      async newGame() {
        await this.$socket.emit('createGameSession', this.$store.state.userId)
      },
      async joinGame(gameId) {
        await this.$socket.emit('joinGameSession', gameId, this.$store.state.userId)
      },
      async clickBox(data) {
        let message = {
          gameId: this.$store.state.gameId,
          box: data.target.dataset.id
        }
        await this.$socket.emit('clickBox', message)
      },
      async registerUser() {
        await this.$socket.emit('registerUser', this.$store.state.userId)
      }
    }
  }
</script>
<style lang="scss" scoped>
.board {
  display: grid;
  padding: 15px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px 100px;
}
.cell {
  border-top: none;
  border-right: 2px solid $c-pink;
  border-bottom: 2px solid $c-pink;
  border-left: none;
  &.active {
    background-color: $c-teal;
  }
  &:nth-child(3),
  &:nth-child(6),
  &:nth-child(9) {
    border-right: none;
  }
  &:nth-child(7),
  &:nth-child(8),
  &:nth-child(9) {
    border-bottom: none;
  }
}
.header {
  background-color: $c-darkPurple;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
}
</style>