<template>
  <div class="start">
    <h1>tictac.fitz.to</h1>
    <router-link class="co-button new_game_button" to="/tic-tac-toe">Start New Game</router-link>
    <form
      class="
        join_form
        co-box
      "
      v-on:submit.prevent="joinGame"
    >
      <h2>Join a game</h2>
      <div class="join_form__inputs">
        <label
          class="join_form__label"
          for="gameId"
        >
          <span class="join_form__label_text">Game ID</span>
          <input
            class="join_form__input"
            type="text"
            name="gameId"
            id="js-game_id_input"
          >
        </label>
        <button
          class="co-button"
          type="submit"
        >Join</button>
      </div>
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
    text-align: center;
    padding: 15px;
  }
  h1 {
    margin-top: 0;
  }
  .new_game_button {
    font-size: 24px;
    padding: 20px;
  }
  .join_form {
    color: $c-teal;
    max-width: 400px;
    margin-top: 20px;
    margin-right: auto;
    margin-left: auto;
    text-align: left;
    &__inputs {
      display: flex;
      width: 100%;
    }
    &__label {
      margin-right: 20px;
      width: 100%;
    }
    &__label_text {}
    &__input {
      border: 2px solid $c-teal;
      padding: 5px;
      width: 100%;
    }
  }
  h2 {
    margin-top: 0;
    text-align: center;
    font-weight: 400;
  }
</style>