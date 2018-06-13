<template>
  <div :class="theme">
    <div class="growlHolder">
      <growl v-for="growl in growls" :type="growl.type" :title="growl.title" :key="growl.id"></growl>
    </div>
    <router-view class="view"></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import Growl from "./ui/AppGrowl";
  import {State} from "vuex-class";

  @Component({
    components: {Growl}
  })
  export default class App extends Vue {
    @State growls: string[];
    @State theme;

  }
</script>
<style lang="sass" scoped>
  .growlHolder
    top: 60px
    min-width: 250px
    /*51 is nav + margin
    left: 5px
    position: absolute
    max-width: 50%
    z-index: 4
    width: 400px
    max-height: calc(100% - 60px)

    /*55 is top, +5px bot
    overflow: hidden
    .progress-wrap
      width: 100%
</style>