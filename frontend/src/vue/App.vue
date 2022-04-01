<template>
  <div class="body">
    <growls />
    <router-view />
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Watch} from 'vue-property-decorator';
import {CurrentUserSettingsModel, GrowlModel} from '@/ts/types/model';
import {State} from '@/ts/instances/storeInstance';
import Growls from '@/vue/parts/Growls.vue';

export default {
  components: {Growls},
  created() {
    console.log('r2d2')
  },
  computed: {
    userSettings: function () {
      return this.$store.userSettings;
    } ,
    mainClass: function () {
      return this.userSettings && this.userSettings.theme || 'color-reg';
    }
  },
}
// @Component({
//   name: 'App',
//   components: {Growls}
// })
// export default class App extends Vue {
//
//   @State
//   public readonly userSettings!: CurrentUserSettingsModel;
//
//   get mainClass(): string {
//     return ;
//   }
//
//   @Watch('mainClass')
//   public onMainClassChange(value: string) {
//     document.body.parentElement!.className = value;
//   }
//
// }
</script>
<style lang="sass" scoped>
  .body
    height: 100%
</style>
