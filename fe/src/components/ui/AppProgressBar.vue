<template>
  <div class="holder">
    <div class="progress-wrap"
         :class="{animated: !finished && ! upload.error, success: finished, error: upload.error}">
      <a :style="style"></a>
      <span>{{text}}</span>
    </div>
    <i v-if="upload.error" class="icon-repeat" @click="click">
    </i>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {bytesToSize} from "../../utils/utils";
  import {UploadProgressModel} from "../../types/model";

  @Component
  export default class AppProgressBar extends Vue {
    @Prop() upload: UploadProgressModel;

    get totalMb() {
      return bytesToSize(this.upload.total);
    }

    get valueMb() {
      return bytesToSize(this.upload.uploaded);
    }

    click() {
      if (this.upload.error) {
        this.$emit('retry');
      }
    }

    get finished() {
      return this.upload.total === this.upload.uploaded && this.upload.total !== 0;
    }

    get text() {
      return this.upload.error ? this.upload.error : this.finished ? "File is processing..." : `${this.valueMb} / ${this.totalMb} (${this.percents})`;
    }

    get style() {
      return {
        width: this.percents
      }
    }

    get percents() {
      return this.upload.total ? `${Math.round(this.upload.uploaded * 100 / this.upload.total)}%` : 0;
    }
  }
</script>

<style lang="sass" scoped>
  @import "partials/mixins"
  $height: 20px
  $stripe-size: $height * 2
  .holder
    text-align: center
    > *
      display: inline-block

  .icon-repeat
    position: relative
    top: -2px
    cursor: pointer

  .progress-wrap
    $border-radius: 10px
    $padding: 2px
    $inner-border-radius: $border-radius - $padding
    width: 200px
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