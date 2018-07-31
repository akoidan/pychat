<template>
  <button :disabled="running" :class="btnClass">
    <div class="spinner" v-if="running"></div>
    <slot></slot>{{value}}
  </button>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";

  @Component
  export default class AppSubmit extends Vue {
    @Prop() value: string;
    @Prop() running: boolean;
    get btnClass() {
      if (this.running) {
        return "sp-loading";
      }
    }
  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"

  .spinner
    display: inline-block
    margin: -4px 10px -4px 10px
    @include spinner(3px, black)

</style>