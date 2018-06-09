<template>
  <div class="reg-log-container">
    <router-link :to="{name: 'register'}" class="signLogBtn">Sign Up</router-link>
    <router-link :to="{name: 'login'}" class="signLogBtn">Log In</router-link>
    <router-view></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";

  @Component
  export default class Main extends Vue {


  }
</script>
