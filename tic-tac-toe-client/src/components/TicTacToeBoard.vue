<template>
  <div class="tic_tac_toe">
    <div class="board">
      <button
        v-for="box in boxes"
        v-bind:key="box['id']"
        v-on:click="clickBox"
        v-bind:data-id=box.id
        class="cell"
        v-bind:class="{ active: box.checked }"
      >
        {{ box.id }}
      </button>
    </div>
    <div>
      Game ID: {{ gameId }}
    </div>
    <div class="buttons">
      <button
        class="button"
        v-on:click=leaveGame
      >Leave Game</button>
      <button
        class="button"
        v-on:click=resetGame
      >Reset Game</button>
    </div>
  </div>
</template>
<script>
  import VueSocketIO from 'vue-socket.io'
  export default {
    name: 'TicTacToeBoard',
    data() {
      return {
        isConnected: false,
        socketMessage: ''
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
      }
    }
  }
</script>
<style>
.board {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px 100px;
}
.cell {
  border: 2px solid darkgray;
}
.cell.active {
  background-color: lightblue;
}
.buttons {
  display: flex;
  margin-top: 100px;
}
.button {
  font-size: 18px;
  padding: 10px 20px;
}
</style>