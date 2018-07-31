<template>
  <div v-else class="spinner">
    <div class="text">{{text}}</div>
    <div class="sp"></div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class AppSpinner extends Vue {
    @Prop() text: string;
  }
</script>

<style lang="sass" scoped>

  @import "partials/mixins"

  .spinner
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    .sp
      @include spinner(10px, white)
    .text
      padding-right: 20px
      font-size: 40px
</style>