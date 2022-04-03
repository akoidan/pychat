<template>
  <transition name="growl">
    <div :class="['growl', growl.type]">
      <!--Single line-->
      <div
        class="icon-cancel"
        @click="close"
      />
      <div v-html="growl.html"/>
    </div>
  </transition>
</template>

<script lang='ts'>
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {GrowlModel} from "@/ts/types/model";

@Component({name: "AppGrowl"})
export default class AppGrowl extends Vue {
  @Prop() public readonly growl!: GrowlModel;

  public close() {
    this.$store.removeGrowl(this.growl);
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/abstract_classes"

.growl-leave-active
  @include transition(0.5s opacity)

.growl-leave-to
  opacity: 0

.growl
  padding: 7px
  padding-right: 10px
  padding-top: 10px
  width: calc(100% - 20px)
  border-radius: 10px
  float: left
  word-wrap: break-word
  white-space: pre-wrap
  margin-bottom: 5px
  position: relative

  .icon-cancel
    cursor: pointer
    position: absolute
    top: 2px
    right: -2px
    font-size: 20px

.growl
  @extend %modal-window

.color-white .growl
  color: white
  width: calc(100% - 50px)
  border-radius: 0px
  padding: 15px
  background-color: rgba(79, 140, 255, 0.9) !important

  &.col-error
    background-color: rgba(201, 52, 1, 0.9) !important

  &.col-success
    background-color: rgba(4, 168, 79, 0.9) !important

.color-reg .growl
  &.col-error
    color: #FF3131

  &.col-success
    color: #5BC25C

  &.col-info
    color: #78CAD8

  .icon-cancel
    @include hover-click(#eb0000)

.color-lor .growl
  &.col-error
    color: red

  &.col-success
    color: #39C03B

  &.col-info
    color: #67bdc0

  .icon-cancel
    color: #a94442

</style>
