<template>
  <div class="holder">
    <div class="progress-wrap">
      <div
        :style="style"
        class="bar"
      />
      <div class="text">
        {{ text }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {bytesToSize} from '@/utils/utils';
import {UploadProgressModel} from '@/types/model';

@Component
export default class AppProgressBar extends Vue {
  @Prop()
  public readonly upload!: UploadProgressModel;

  get totalMb() {
    return bytesToSize(this.upload.total);
  }

  get valueMb() {
    return bytesToSize(this.upload.uploaded);
  }

  get finished() {
    return this.upload.total === this.upload.uploaded && this.upload.total !== 0;
  }

  get text() {
    return `${this.valueMb} / ${this.totalMb} (${this.percents})`;
  }

  get style() {
    return {
      width: this.percents
    };
  }

  get percents() {
    return this.upload.total ? `${Math.round(this.upload.uploaded * 100 / this.upload.total)}%` : 0;
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins"
  $height: 20px
  $stripe-size: $height * 2
  .holder
    text-align: center
    > *
      display: inline-block

  $border-radius: 10px
  $padding: 2px
  $inner-border-radius: $border-radius - $padding

  .progress-wrap

    width: 200px
    position: relative
    height: $height
    background: #1a1e22
    border-radius: $border-radius
    padding: $padding
    box-shadow: inset 0 1px 1px 0 black, 0 1px 1px 0 #36393F


  .text
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    text-align: center

  .bar
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
    background: #1c3859
    @include linear-gradient-values(135deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)
    @include raw-animation(animate-bars 2s linear infinite)
    background-size: $stripe-size $stripe-size
    &:before
      content: ""
      position: absolute
      border-radius: $inner-border-radius
      height: 100%
      width: 100%
      left: 0
      top: 0
      @include linear-gradient-values(top, rgba(255, 255, 255, 0.30), rgba(0, 0, 0, 0.3))

  @include keyframes(animate-bars)
    from
      background-position: 0 0
    to
      background-position: $stripe-size 0


</style>
