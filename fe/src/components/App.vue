<template>
  <div :class="theme" class="body">
    <div class="growlHolder">
      <growl v-for="growl in growls" :growl="growl" :key="growl.id"></growl>
    </div>
    <router-view/>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import Growl from "./ui/AppGrowl";
  import {State} from "vuex-class";
  import {globalLogger} from '../utils/singletons';

  @Component({
    components: {Growl}
  })
  export default class App extends Vue {
    @State growls: string[];
    @State userInfo;

    get theme (){
      return this.userInfo && this.userInfo.theme || 'color-reg';
    }

    created() {
      globalLogger.log("rendering app")();
    }

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
</style>