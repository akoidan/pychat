<template>
  <div class="body">
    <div class="growlHolder">
      <growl
        v-for="growl in growls"
        :key="growl.id"
        :growl="growl"
      />
    </div>
    <router-view />
  </div>
</template>

<script lang='ts'>
import Growl from '@/vue/ui/AppGrowl';
import {Component, Vue, Watch} from 'vue-property-decorator';
import {CurrentUserSettingsModel, GrowlModel} from '@/ts/types/model';
import {State} from '@/ts/instances/storeInstance';

@Component({
  components: {Growl}
})
export default class App extends Vue {

  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  @State
  public readonly growls!: GrowlModel[];

  get mainClass(): string {
    return this.userSettings && this.userSettings.theme || 'color-reg';
  }

  @Watch('mainClass')
  public onMainClassChange(value: string) {
    document.body.parentElement!.className = value;
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
