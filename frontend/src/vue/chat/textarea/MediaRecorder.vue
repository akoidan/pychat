<template>
  <!--  prevent loosing focus from contenteditable-->
  <div class="videoHolder" v-show="recordState !=='pause'" @mousedown.prevent>
    <div v-show="recordState ==='running'" @click="releaseRecord">
      <span class="click-info">Click on this image to finish record</span>
      <video
        v-show="isVideo"
        ref="video"
        muted="muted"
        autoplay=""
      />
      <img
        v-show="!isVideo"
        src='@/assets/img/audio.svg'
        class="audio-recording-now"
      >
    </div>
    <span v-show="recordState === 'starting'">Starting recording...</span>
  </div>
</template>
<script lang="ts">

import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Vue,
  Emit,
  Ref,
  Prop
} from "vue-property-decorator";
import MediaCapture from '@/ts/classes/MediaCapture';

import {
  isChrome,
  isMobile
} from '@/ts/utils/runtimeConsts';


@Component({name: 'MediaRecorder'})
 export default class MediaRecorder extends Vue {

  @Ref()
  public video!: HTMLVideoElement;

  @Prop()
  public readonly isVideo!: boolean;

  private recordState: 'pause' | 'starting' |'running' = 'pause';

  navigatorRecord: MediaCapture|null = null;

  async startRecord() {
    this.$logger.debug("Starting recording... {}")();
    this.recordState = 'starting';
    this.navigatorRecord = new MediaCapture(this.isVideo, this.$platformUtil);
    try {
      let src: MediaStream = (await this.navigatorRecord.record())!;
      this.video.srcObject = src;
      this.recordState = 'running';
    } catch (error: any) {
      this.recordState = 'pause';
      if (String(error.message).includes("Permission denied")) {
        if (isChrome && !isMobile) {
          this.$store.growlError(`Please allow access for ${document.location.origin} in chrome://settings/content/microphone`);
        } else {
          this.$store.growlError(`You blocked the access to microphone/video. Please Allow it to continue`);
        }
      } else {
        this.$store.growlError("Unable to capture input device because " + error.message);
      }
      this.$logger.error("Error during capturing media {} {}", error, error.message)();
      this.navigatorRecord.stopRecording();
      throw error;
    }
  }

  private emitData(data:unknown) {
    if (this.isVideo) {
      this.$emit("video", data);
    } else {
      this.$emit("audio", data);
    }
  }

  async releaseRecord() {
    this.recordState = 'pause';
    let data: Blob|null = await this.navigatorRecord!.stopRecording();
    this.$logger.debug("Finishing recording... {}", data)();
    if (data) {
      this.emitData(data);
    }
  }

}
</script>

<style lang="sass" scoped>
  @import "@/assets/sass/partials/abstract_classes"
  @import "@/assets/sass/partials/mixins"

  .click-info
    position: absolute
    z-index: 1
  .video-playing
    bottom: 0
  .videoHolder
    cursor: pointer
    z-index: 2
    +wrapper-inner
    justify-content: center
    background-color: black
    border: 1px solid rgba(126, 126, 126, 0.5)
    max-width: calc(100% - 2px)
    right: 0
    left: 0
    > div
      display: flex
      align-items: center
      justify-content: center
    video, .audio-recording-now
      position: relative
      top: 50%
      transform: translateY(-50%)
    video
      max-width: 100%
      max-height: 100%

    .audio-recording-now
      height: 200px

  .icon-webrtc-video, .icon-mic-1
    @extend %chat-icon
    z-index: 2
    right: 35px
  .icon-webrtc-video
    margin-top: 2px
</style>
