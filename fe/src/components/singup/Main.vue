<template>
  <div class="reg-log-container">
    <router-link :to="{name: 'register'}" class="signLogBtn f">Sign Up</router-link>
    <router-link :to="{name: 'login'}" class="signLogBtn s">Log In</router-link>
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

  @import 'partials/mixins.sass'
  h1
    text-align: center
    padding: 30px 0 30px 0
    font: 25px Oswald
    color: #FFF
    text-transform: uppercase
    text-shadow: #000 0 1px 5px
    margin: 0

  .reg-log-container
    overflow-y: auto
    padding: 20px
    max-width: 300px
    flex-basis: 300px
    margin: auto

  @import "register"

  .signLogBtn
    @extend %top-btn-register
    &:not(.router-link-active)
      @include linear-gradient-hover($grayish-green, #434343, 15px, 12px, #434343)
      @extend %top-btn-register
      border-radius: 0
    width: calc(50% - 26px)
    text-align: center
    display: inline-block
  .f
    margin-right: -2px
  .s
    margin-left: -2px
  .router-link-active
    @extend %cyan-btn


</style>
