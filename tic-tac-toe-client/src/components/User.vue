<template>
  <div class="user_display">
    <div class="icon_wrap">
      <UserIcon
        v-on:click=resetUserName
        class="icon"
      />
    </div>
    <div class="user_name">
      {{ userName }}
    </div>
    <form
      class="user_reg"
      v-bind:class="{'is-closed': emptyUserName}"
      v-on:submit.prevent="setUserName"
      id="js-user_form"
    >
      <p>What would you like your username to be?</p>
      <div class="input_row">
        <label for="username">
          <span class="username_label">Username</span>
          <input
            class="username_input"
            type="text"
            name="username"
          >
        </label>
        <button
          class="username_submit"
          type="submit"
        >Submit</button>
      </div>
    </form>
  </div>
</template>
<script>
  import UserIcon from '../assets/icons/user.svg'
  export default {
    name: 'User',
    components: {
      UserIcon
    },
    computed: {
      emptyUserName() {
        return (this.$store.state.userName !== '')
      },
      userName() {
        return this.$store.state.userName
      }
    },
    methods: {
      setUserName () {
        let userForm = document.getElementById('js-user_form')
        this.$store.commit('setUserName', userForm.elements.username.value)
      },
      resetUserName () {
        this.$store.commit('setUserName', '')
      }
    }
  }
</script>
<style lang="scss" scoped>
  .user_display {
    align-items: center;
    display: flex;
    position: relative;
  }
  .user_reg {
    background-color: $c-darkPurple;
    border: 2px solid $c-teal;
    font-size: 16px;
    left: -10px;
    padding: 15px 15px 20px 15px;
    position: absolute;
    top: calc(100% + 20px);
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
      left: 9px;
      position: absolute;
      transform: rotate(45deg);
      top: -11px;
      width: 18px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
  }
  .input_row {
    display: flex;
  }
  .username_label {
    display: block;
  }
  .username_input {
    border: 2px solid $c-teal;
    margin-right: 10px;
    padding: 5px 10px;
  }
  .username_submit {
    background-color: transparent;
    border: 2px solid $c-teal;
    color: white;
    padding: 5px 10px;
    transition: color 0.2s ease, background-color 0.2s ease;
    &:hover,
    &:active,
    &:focus {
      background-color: $c-teal;
      color: #180d27;
    }
  }
  .icon_wrap {
    align-items: center;
    background-color: $c-teal;
    border-radius: 100%;
    display: flex;
    height: 35px;
    justify-content: center;
    margin-right: 10px;
    overflow: hidden;
    width: 35px;
  }
  .icon {
    display: inline-block;
    path,
    circle {
      stroke: $c-darkPurple;
    }
  }
  .user_name {
    color: $c-teal;
  }
</style>