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
    <button
      class="reset_button"
      v-on:click="resetGame"
    >Reset Game</button>
  </div>
</template>
<script>
  import VueSocketIO from 'vue-socket.io'
  export default {
    name: 'TicTacToeBoard',
    computed: {
      boxes() {
        return this.$store.state.boxes
      }
    },
    data() {
      return {
        isConnected: false,
        socketMessage: ''
      }
    },
    async mounted () {
      // @TODO next need to check if joining game
      await this.$socket.emit('createGameSession')
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
      },
      setBoxes (data) {
        this.$store.dispatch('checkBox', data)
      }
    },
    methods: {
      async clickBox(data) {
        let message = {
          gameId: this.$store.state.gameId,
          box: data.target.dataset.id
        }
        await this.$socket.emit('clickBox', message)
      },
      async resetGame() {
        await this.$socket.emit('resetGame')
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
.reset_button {
  font-size: 18px;
  margin-top: 100px;
  padding: 10px 20px;
}
</style>