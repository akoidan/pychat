<template>
  <div class="body">
    <growls/>
    <router-view/>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
  Watch,
} from "vue-property-decorator";
import {CurrentUserSettingsModel} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";
import Growls from "@/vue/parts/Growls.vue";

@Component({
  name: "App",
  components: {Growls},
})
export default class App extends Vue {
  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  public get mainClass(): string {
    return this.userSettings && this.userSettings.theme || "color-reg";
  }

  @Watch("mainClass")
  public onMainClassChange(value: string) {
    document.body.parentElement!.className = value;
  }
}
</script>
<style lang="sass" scoped>
.body
  height: 100%
</style>
