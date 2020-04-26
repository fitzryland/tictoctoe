<template>
  <div class="tic_tac_toe">
    <header class="header">
      <User />
      <div class="session_actions">
        <button
          class="
            session_actions__icon
            session_actions__icon--share
          "
          v-on:click=toggleShare
        >
          <ShareIcon />
        </button>
        <button
          class="session_actions__icon"
          v-on:click=resetGame
        >
          <RestartIcon />
        </button>
        <button
          class="session_actions__icon"
          v-on:click=leaveGame
        >
          <ExitIcon />
        </button>
        <div
          class="share"
          v-bind:class="{'is-closed': hideShare}"
        >
          Game ID: {{ gameId }}
        </div>
      </div>
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
  import RestartIcon from '../assets/icons/refresh-cw.svg'
  import ExitIcon from '../assets/icons/x.svg'
  import ShareIcon from '../assets/icons/share.svg'
  export default {
    name: 'TicTacToeBoard',
    components: {
      User,
      RestartIcon,
      ExitIcon,
      ShareIcon
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
        this.$store.dispatch('newGame', data)
        this.$store.commit('setGameId', data.id)
      },
      setBoxes (data) {
        this.$store.dispatch('checkBox', data)
      },
      updateGame (game) {
        if ( game.status ) {
          // update the state
          this.$store.commit('newGameMut', game)
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
      async resetGame() {
        await this.$socket.emit('resetGame', this.$store.state.gameId)
      },
      async leaveGame() {
        await this.$socket.emit('leaveGame', this.$store.state.gameId, this.$store.state.userId)
        this.$store.commit('setGameId', null)
        this.$router.push('/')
      },
      async registerUser() {
        await this.$socket.emit('registerUser', this.$store.state.userId)
      },
      toggleShare() {
        this.hideShare = ! this.hideShare
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
.session_actions {
  display: flex;
  position: relative;
  &__icon {
    align-items: center;
    background-color: $c-teal;
    border: none;
    border-radius: 100%;
    display: flex;
    height: 35px;
    justify-content: center;
    margin-left: 15px;
    overflow: hidden;
    padding: 0;
    width: 35px;
    &--share {}
  }
}
.share {
  background-color: $c-darkPurple;
  border: 2px solid $c-teal;
  padding: 15px 15px 20px 15px;
  left: -4px;
  position: absolute;
  top: calc(100% + 18px);
  transition: opacity 0.5s ease, transform 0.7s ease;
  &.is-closed {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-20px);
  }
  &:before {
    background-color: $c-darkPurple;
    border-top: 2px solid $c-teal;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-left: 2px solid $c-teal;
    content: "";
    display: block;
    height: 18px;
    left: 20px;
    position: absolute;
    transform: rotate(45deg);
    top: -11px;
    width: 18px;
  }
}
</style>