<template>
  <div class="spinner">
    <div class="lds-hourglass"></div>
    <div class="text">{{text}}</div>
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

  .lds-hourglass:after
    content: " "
    display: block
    border-radius: 50%
    width: 25px
    height: 25px
    margin: 6px
    box-sizing: border-box
    border: 25px solid #fff
    border-color: #fff transparent #fff transparent
    animation: lds-hourglass 1.2s infinite

  @keyframes lds-hourglass
    0%
      transform: rotate(0)
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19)
    50%
      transform: rotate(900deg)
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1)
    100%
      transform: rotate(1800deg)
</style>
