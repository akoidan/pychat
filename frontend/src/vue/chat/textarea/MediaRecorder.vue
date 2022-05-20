<template>
  <!--  prevent loosing focus from contenteditable-->
  <div v-show="recordState !== 'pause'" class="videoHolder" @mousedown.prevent>
    <div v-show="recordState === 'running'" @click="releaseRecord">
      <span class="click-info">Click on this image to finish record</span>
      <video
        v-show="isVideo"
        ref="video"
        autoplay
        muted
      />
      <img
        v-show="!isVideo"
        class="audio-recording-now"
        src="@/assets/img/audio.svg"
      />
    </div>
    <span v-show="recordState === 'starting'">Starting recording...</span>
  </div>
</template>
<script lang="ts">

import {Component, Prop, Ref, Vue,} from "vue-property-decorator";
import MediaCapture from "@/ts/classes/MediaCapture";

import {isChrome, isMobile,} from "@/ts/utils/runtimeConsts";


@Component({name: "MediaRecorder"})
export default class MediaRecorder extends Vue {
  @Ref()
  public video!: HTMLVideoElement;

  @Prop()
  public readonly isVideo!: boolean;

  public recordState: "pause" | "running" | "starting" = "pause";

  navigatorRecord: MediaCapture | null = null;

  async startRecord() {
    this.$logger.debug("Starting recording... {}")();
    this.recordState = "starting";
    this.navigatorRecord = new MediaCapture(this.isVideo, this.$platformUtil);
    try {
      const src: MediaStream = (await this.navigatorRecord.record())!;
      this.video.srcObject = src;
      this.recordState = "running";
    } catch (error: any) {
      this.recordState = "pause";
      if (String(error.message).includes("Permission denied")) {
        if (isChrome && !isMobile) {
          this.$store.growlError(`Please allow access for ${document.location.origin} in chrome://settings/content/microphone`);
        } else {
          this.$store.growlError("You blocked the access to microphone/video. Please Allow it to continue");
        }
      } else {
        this.$store.growlError(`Unable to capture input device because ${error.message}`);
      }
      this.$logger.error("Error during capturing media {} {}", error, error.message)();
      this.navigatorRecord.stopRecording();
      throw error;
    }
  }

  async releaseRecord() {
    this.recordState = "pause";
    const data: Blob | null = await this.navigatorRecord!.stopRecording();
    this.$logger.debug("Finishing recording... {}", data)();
    if (data) {
      this.emitData(data);
    }
  }

  private emitData(data: unknown) {
    if (this.isVideo) {
      this.$emit("video", data);
    } else {
      this.$emit("audio", data);
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
