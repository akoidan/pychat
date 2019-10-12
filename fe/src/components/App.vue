<template>
  <div class="body">
    <div class="growlHolder">
      <growl v-for="growl in growls" :growl="growl" :key="growl.id"/>
    </div>
    <router-view/>
  </div>
</template>

<script lang='ts'>

  import Growl from "@/components/ui/AppGrowl";
  import {Component, Vue, Watch} from "vue-property-decorator";
  import {GrowlModel} from "@/types/model";
  import {State} from '@/utils/storeHolder';

  @Component({
    components: {Growl}
  })
  export default class App extends Vue {

    get mainClass(): string {
      return this.store.userSettings && this.store.userSettings.theme || 'color-reg';
    }

    @State
    public growls: GrowlModel[];

    @Watch('mainClass')
    onMainClassChange(value) {
      document.body.parentElement.className = value;
    }

  }
</script>
<style lang="sass" scoped>
  .body
    height: 100%
  .growlHolder
    top: 10px
    min-width: 250px
    /*51 is nav + margin
    left: 10px
    position: absolute
    max-width: 50%
    z-index: 1
    width: 400px
    max-height: calc(100% - 60px)

    /*55 is top, +5px bot
    overflow: hidden
    .progress-wrap
      width: 100%
</style>
