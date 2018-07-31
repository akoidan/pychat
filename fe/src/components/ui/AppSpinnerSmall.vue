<template>
  <div v-else class="spinner">
    <div class="text">{{text}}</div>
    <div class="sp"></div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class AppSpinner extends Vue {
    @Prop() text: string;
  }
</script>

<style lang="sass" scoped>

  @import "partials/mixins"

  .spinner
    height: 20px
    display: flex
    align-items: center
    justify-content: center
    .sp
      @include spinner(4px, white)

  .text
    padding-right: 5px
</style>