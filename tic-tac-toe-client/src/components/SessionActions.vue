<template>
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
</template>
<script>
  import RestartIcon from '../assets/icons/refresh-cw.svg'
  import ExitIcon from '../assets/icons/x.svg'
  import ShareIcon from '../assets/icons/share.svg'
  export default {
    name: 'SessionActions',
    components: {
      RestartIcon,
      ExitIcon,
      ShareIcon
    },
    data() {
      return {
        hideShare: true
      }
    },
    computed: {
      gameId() {
        let gameId = this.$store.state.gameId
        return gameId
      }
    },
    methods: {
      async resetGame() {
        await this.$socket.emit('resetGame', this.$store.state.gameId)
      },
      async leaveGame() {
        await this.$socket.emit('leaveGame', this.$store.state.gameId, this.$store.state.userId)
        this.$store.commit('setGameId', null)
        this.$router.push('/')
      },
      toggleShare() {
        this.hideShare = ! this.hideShare
      }
    }
  }
</script>
<style lang="scss" scoped>
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