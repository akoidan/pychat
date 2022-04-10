<template>
  <div>
    <img v-show="loaded" :src="src" @load="onImgLoad"/>
    <div v-if="!loaded" class="spinner"/>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";

@Component({
  name: "AppLoadingImage",
})
export default class AppLoadingImage extends Vue {
  @Prop() public src!: string;

  public loaded: boolean = false;

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
