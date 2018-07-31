<template>
  <div class='reg-required'>
    <i v-bind:class="[icon, validation]"></i>
      <slot/>
    <div class="slider" :class='{closed}'>
      {{ description }}
    </div>
  </div>
</template>
<script lang="ts">

  import Vue from "vue";
  import {Prop, Component} from "vue-property-decorator";
  import {IconColor} from '../../types/types';


  @Component
  export default class FieldSet extends Vue {
    @Prop() icon: string;
    @Prop() validation: IconColor;
    @Prop() description: string;
    @Prop() closed: boolean = true;

  }
</script>
<style lang="sass" scoped>

  @import "partials/abstract_classes"
  .slider
    @extend %slider
    overflow-y: hidden
    height: 30px

    /* approximate max height
    transition: 1s height 0s

    &.closed
      height: 2px // Chrome53 pushes block all FORM left if height is set to 0

  .reg-required
    position: relative

    &:after
      content: " *"
      position: absolute
      right: 7px
      top: 17px
      font-size: 17px
      display: inline-block
      font-weight: bold
      color: #6E6E6E

  i
    @extend %i

</style>