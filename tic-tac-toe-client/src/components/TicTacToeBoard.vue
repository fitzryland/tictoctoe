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
        v-bind:class="{
          active: box.checked,
          'is-x': box.checked === 'X',
          'is-o': box.checked === 'O'
        }"
      >
        <X v-if="box.checked === 'X'" />
        <O v-if="box.checked === 'O'" />
      </button>
    </div>
    <div class="status"></div>
    isTurn: {{ isTurn }} <br />
    team: {{ team }} <br />
    isObserver: {{ isObserver }} <br />
  </div>
</template>
<script>
  import VueSocketIO from 'vue-socket.io'
  import User from './User.vue'
  import SessionActions from './SessionActions.vue'
  import X from '../assets/icons/x.svg'
  import O from '../assets/icons/circle.svg'
  export default {
    name: 'TicTacToeBoard',
    components: {
      User,
      SessionActions,
      X,
      O
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
        return this.$store.state.boxes
      },
      gameId() {
        return this.$store.state.gameId
      },
      isTurn() {
        return this.$store.state.isTurn
      },
      team() {
        return this.$store.state.team
      },
      isObserver() {
        return this.$store.state.isObserver
      }
    },
    async mounted () {
      this.registerUser()
      let gameId = this.$store.state.gameId
      if ( gameId ) {
        this.emitJoinGame(gameId);
      } else {
        this.emitNewGame();
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
      updateGame (data) {
        this.$store.commit('updateGameMut', data)
      }
    },
    methods: {
      async emitNewGame() {
        await this.$socket.emit('createGameSession', this.$store.state.userId)
      },
      async emitJoinGame(gameId) {
        await this.$socket.emit('joinGameSession', gameId, this.$store.state.userId)
      },
      async clickBox(data) {
        let message = {
          gameId: this.$store.state.gameId,
          box: data.target.dataset.id,
          userId: this.$store.state.userId
        }
        console.log('message', message)
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
  &.active {
    background-color: $c-teal;
  }
  &.is-x,
  &.is-o {
    &:before {
    }
  }
  &.is-x {}
  &.is-o {}
}
.header {
  background-color: $c-darkPurple;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
}
</style>