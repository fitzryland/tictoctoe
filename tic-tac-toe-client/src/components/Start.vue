<template>
  <div class="start">
    <p>Would you like to start a new game or join an existing game?</p>
    <router-link to="/tic-tac-toe">Start New Game</router-link>
    <p>Join a game:</p>
    <form v-on:submit.prevent="joinGame">
      <label for="gameId">
        Game ID:
        <input
          type="text"
          name="gameId"
          id="js-game_id_input"
        >
      </label>
      <button type="submit">Join</button>
    </form>
  </div>
</template>
<script>
  export default {
    name: 'Start',
    methods: {
      joinGame(e) {
        e.preventDefault()
        let gameId = document.getElementById('js-game_id_input').value
        this.$store.commit('setGameId', gameId)
        this.$router.push('tic-tac-toe')
      }
    }
  }
</script>