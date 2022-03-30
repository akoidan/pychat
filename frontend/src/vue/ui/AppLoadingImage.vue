<template>
  <div>
    <img :src="src" @load="onImgLoad" v-show="loaded"/>
    <div v-if="!loaded" class="spinner"/>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch, Ref} from "vue-property-decorator";
import { CallsInfoModel } from '@/ts/types/model';

@Component
export default class AppLoadingImage extends Vue {
  @Prop() public src!: string;
  private loaded: boolean = false;

  onImgLoad() {
    this.loaded = true;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"

.spinner
  margin: auto
  @include spinner(3px, white)
</style>
