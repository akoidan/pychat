<template>
  <div class="growlHolder">
    <app-growl
      v-for="growl in last3Growl"
      :key="growl.id"
      :growl="growl"
    />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import type {GrowlModel} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";
import AppGrowl from "@/vue/ui/AppGrowl.vue";

@Component({
  components: {AppGrowl},
})
export default class Growls extends Vue {
  @Watch("$route", {immediate: true,
    deep: true})
  onUrlChange(newVal: any) {
    this.$store.clearGrowls();
  }

  @State
  public readonly growls!: GrowlModel[];

  get last3Growl(): GrowlModel[] {
    return this.growls.slice(-3);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  .growlHolder
    top: 10px
    min-width: 250px
    /*51 is nav + margin
    right: 10px
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
