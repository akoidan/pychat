<template>
  <div class="videoHolder" v-show="dim">
    <div v-show="recordingNow">
      <video
        v-show="srcVideo"
        ref="video"
        muted="muted"
        autoplay=""
      />
      <img
        v-show="!srcVideo"
        src="@/assets/img/audio.svg"
        class="audio-recording-now"
      >
    </div>
    <span v-show="!recordingNow">Starting recording...</span>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch
} from 'vue-property-decorator';
import { State } from '@/ts/instances/storeInstance';

@Component
  export default class ChatRecording extends Vue {


    @State
    public readonly dim!: boolean;

    @Ref()
    public video!: HTMLVideoElement;

    @Prop()
    public readonly srcVideo!: string;

    @Prop()
    public readonly recordingNow!: boolean;


    @Watch('srcVideo')
    public onSrcChange(value: MediaStream | MediaSource | Blob | null) {
      if (this.video) {
        this.video.srcObject = value;
      }
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins"
  .videoHolder
    z-index: 2
    +wrapper-inner
    justify-content: center
    position: relative
    video, .audio-recording-now
      position: relative
      top: 50%
      transform: translateY(-50%)
    video
      border: 1px solid rgba(126, 126, 126, 0.5)
    .audio-recording-now
      height: 200px
</style>
