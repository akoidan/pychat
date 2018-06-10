<template>
  <div class="reg-log-container">
    <router-link :to="{name: 'register'}" class="signLogBtn">Sign Up</router-link>
    <router-link :to="{name: 'login'}" class="signLogBtn">Log In</router-link>
    <h1>{{regHeader}}</h1>
    <router-view></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";

  @Component
  export default class Main extends Vue {
    @State regHeader;

  }
</script>
<style lang="sass" scoped>
  h1
    text-align: center
    padding: 30px 0 30px 0
    font: 25px Oswald
    color: #FFF
    text-transform: uppercase
    text-shadow: #000 0 1px 5px
    margin: 0

</style>
