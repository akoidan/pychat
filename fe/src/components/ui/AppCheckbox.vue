<template>
  <div>
    <input v-bind:checked="value" @change='onchange' ref="checkbox" type="checkbox" :id="uniqueId">
    <label :for="uniqueId"></label>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {getUniqueId} from "../../utils/htmlApi";

  @Component
  export default class AppCheckbox extends Vue {

    $refs: {
      checkbox: HTMLInputElement;
    };

    @Prop() value: boolean;

    onchange(e: Event) {
      this.$emit('input', this.$refs.checkbox.checked);
    }

    uniqueId: string;
    created() {
      this.uniqueId = `checkboxN${getUniqueId()}`;
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"

  input[type=checkbox]
    display: none
    + label
      display: block
      @include linear-double-gradient(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1), #{'left, #2f4e2d 50%'}, #812626 50%)
      background-size: 100% 100%, 200% 100%
      background-position: 0 0, 15px 0
      border-radius: 25px
      box-shadow: inset 0 1px 4px hsla(0, 0%, 0%, .5), inset 0 0 10px hsla(0, 0%, 0%, .5), 0 0 0 1px hsla(0, 0%, 0%, .1), 0 -1px 2px 2px hsla(0, 0%, 0%, .25), 0 2px 2px 2px hsla(0, 0%, 100%, .15)
      cursor: pointer
      height: 25px
      width: 75px
      position: relative
      @include transition(.25s)

      &:before
        display: block
        background-color: #eee
        @include linear-gradient(#4B4E45, #33352F)
        border-radius: 25px
        box-shadow: inset 0 1px 1px 1px hsla(0, 0%, 100%, 0.1), inset 0 -1px 1px 1px hsla(0, 0%, 0%, .25), 0 1px 3px 1px hsla(0, 0%, 0%, .5), 0 0 2px hsla(0, 0%, 0%, .25)
        content: ''
        height: 25px
        width: 50px
        left: 0
        top: 0

    &:checked + label
      background-position: 0 0, 35px 0 !important
      padding-left: 25px
      padding-right: 0
      width: 50px
      z-index: 2
</style>