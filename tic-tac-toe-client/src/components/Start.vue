<template>
  <div class="start">
    <h1>Tic Tac Toe</h1>
    <p>Would you like to start a new game or join an existing game?</p>
    <router-link to="/tic-tac-toe">Start New Game</router-link>
    <p>Join a game:</p>
    <form
      class="
        join_form
        co-box
      "
      v-on:submit.prevent="joinGame"
    >
      <label for="gameId">
        Game ID:
        <input
          type="text"
          name="gameId"
          id="js-game_id_input"
        >
      </label>
      <button
        class="co-button"
        type="submit"
      >Join</button>
    </form>
  </div>
</template>
<script>
  export default {
    name: 'Start',
    methods: {
      joinGame(e) {
        let gameId = document.getElementById('js-game_id_input').value
        this.goToGame(gameId)
      },
      goToGame(gameId) {
        this.$store.commit('setGameId', gameId)
        this.$router.push('tic-tac-toe')
      }
    },
    mounted() {
      if ( this.$route.query.game ) {
        this.goToGame(this.$route.query.game)
      }
    }
  }
</script>
<style scoped lang="scss">
  .start {
    padding: 15px;
  }
  h1 {
    margin-top: 0;
  }
  .join_form {
    color: $c-teal;
  }
</style>