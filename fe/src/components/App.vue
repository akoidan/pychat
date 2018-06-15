<template>
  <div :class="theme" class="holder">
    <div class="growlHolder">
      <growl v-for="growl in growls" :growl="growl" :key="growl.id"></growl>
    </div>
    <app-nav class="noSelection" v-if="userInfo" :user-info="userInfo"/>
    <router-view class="view"></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import Growl from "./ui/AppGrowl";
  import {State} from "vuex-class";
  import AppNav from "./AppNav.vue";

  @Component({
    components: {Growl, AppNav}
  })
  export default class App extends Vue {
    @State growls: string[];
    @State theme;
    @State userInfo;

  }
</script>
<style lang="sass" scoped>
  .growlHolder
    top: 10px
    min-width: 250px
    /*51 is nav + margin
    left: 10px
    position: absolute
    max-width: 50%
    z-index: 4
    width: 400px
    max-height: calc(100% - 60px)

    /*55 is top, +5px bot
    overflow: hidden
    .progress-wrap
      width: 100%
  .holder
    height: 100vh
</style>