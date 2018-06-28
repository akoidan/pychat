<template>
  <div class="progress-wrap" :class="{animated: !finished, success: finished}">
    <a :style="style"></a>
    <span>{{text}}</span>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {bytesToSize} from '../../utils/utils';

  @Component
  export default class AppProgressBar extends Vue {
    @Prop() total: number;
    @Prop() value: number;

    get totalMb() {
      return bytesToSize(this.total);
    }

    get valueMb() {
      return bytesToSize(this.value);
    }

    get finished() {
      return this.total === this.value;
    }

    get text() {
      return this.finished ? 'Finished' : `${this.valueMb} / ${this.totalMb} (${this.percents})`;
    }

    get style() {
      return {
        width: this.percents
      }
    }

    get percents() {
      return `${Math.round(this.value * 100 / this.total)}%`;
    }
  }
</script>

<style lang="sass" scoped>
  @import "partials/mixins"
  $height: 20px
  $stripe-size: $height * 2
  .progress-wrap
    $border-radius: 10px
    $padding: 2px
    $inner-border-radius: $border-radius - $padding
    display: block
    width: 200px
    margin: 0 auto
    position: relative
    height: $height
    background: #1a1e22
    border-radius: $border-radius
    padding: $padding
    box-shadow: inset 0 1px 1px 0 black, 0 1px 1px 0 #36393F
    > a
      overflow: hidden
      height: 100%
      line-height: $height
      font-size: 14px
      display: inline-block
      margin: 0
      color: #e7e7e7
      float: left
      border-radius: $inner-border-radius
      position: relative
      text-align: center
      &:before
        content: ""
        position: absolute
        border-radius: $inner-border-radius
        height: 100%
        width: 100%
        left: 0
        top: 0
        @include linear-gradient-values(top, rgba(255, 255, 255, 0.30), rgba(0, 0, 0, 0.3))
    span
      position: absolute
      text-align: center
      left: 0
      width: 100%
    &.animated > a
      background: #1c3859
      @include linear-gradient-values(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)
      @include raw-animation(animate-bars 2s linear infinite)
      background-size: $stripe-size $stripe-size
    &.success > a
      background-color: #18611f
    &.error > a
      background-color: #700000

  @include keyframes(animate-bars)
    from
      background-position: 0 0
    to
      background-position: $stripe-size 0




</style>