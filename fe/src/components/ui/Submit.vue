<template>
  <button :disabled="running" :class="btnClass">
    {{value}}
    <div class="spinner" v-if="running"></div>
  </button>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";

  @Component
  export default class Submit extends Vue {
    @Prop() value: string;
    @Prop() running: boolean;
    get btnClass() {
      if (this.running) {
        return "sp-loading";
      }
    }
  }
</script>
<style lang="sass">

  @mixin spinner($size)
    width: $size * 7
    height: $size * 7
    -webkit-animation: sp-rotate 1s infinite linear
    border-radius: $size * 15
    border-bottom: $size solid black

  @-webkit-keyframes sp-rotate
    to
      -webkit-transform: rotate(360deg)
  .sp-loading
    cursor: not-allowed
  .spinner
    display: inline-block
    @include spinner(3px)

</style>