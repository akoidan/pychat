<template>
  <div
    @contextmenu.prevent
    @drag.prevent
    @mouseup="releaseRecord"
    @mouseout="releaseRecord"
    @mousedown="switchRecord"
    @touchstart="switchRecord"
    @touchend="releaseRecord"
  >
    <i
      v-show="isRecordingVideo"
      class="icon-webrtc-video"
      title="Hold on to send video"
    />
    <i
      v-show="!isRecordingVideo"
      class="icon-mic-1"
      title="Hold on to send audio"
    />
  </div>
</template>
<script lang="ts">

  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {stopVideo} from '@/utils/htmlApi';
  import MediaCapture from '@/utils/MediaCapture';
  import {isChrome, isMobile} from "@/utils/singletons";
  import {askAudioPermissions} from '@/utils/android';

  const HOLD_TIMEOUT = 500;

  declare var MediaRecorder: any;

  @Component
  export default class MediaRecorderDiv extends Vue {

    isRecordingVideo = true;
    @State
    public readonly dim!: boolean;

    // started: number = null;
    timeout: number = 0;
    navigatorRecord: MediaCapture|null = null;


    async switchRecord() {
      this.logger.debug("switch recrod...")();
      // this.started = Date.now();
      await new Promise((resolve) => this.timeout = window.setTimeout(resolve, HOLD_TIMEOUT));
      this.timeout = 0;
      await this.startRecord();
      this.logger.debug("switch record timeouted...")();
      this.timeout = 0;
    }

    async startRecord() {
      this.logger.debug("Starting recording...")();
      this.store.setDim(true);
      await askAudioPermissions(this.isRecordingVideo);
      // TODO wtf unknown
      this.navigatorRecord = new MediaCapture(this.isRecordingVideo, (data: unknown) => {
        this.logger.debug("Finishing recording... {}", data)();
        this.store.setDim(false);
        if (data) {
          this.emitData(data);
        }
      });
      try {
        let src: MediaStream = (await this.navigatorRecord.record())!;
        this.logger.debug("Resolved record emitting video")();
        this.$emit("record", {isVideo: this.isRecordingVideo, src: src});
      } catch (error) {
        this.store.setDim(false);
        this.emitData(null);
        if (String(error.message).indexOf("Permission denied") >= 0) {
          if (isChrome && !isMobile) {
            this.store.growlError(`Please allow access for ${document.location.origin} in chrome://settings/content/microphone`);
          } else {
            this.store.growlError(`You blocked the access to microphone/video. Please Allow it to continue`);
          }
        } else {
          this.store.growlError("Unable to capture input device because " + error.message);
        }
        this.logger.error("Error during capturing media {} {}", error, error.message)();
        this.navigatorRecord.stopRecording();
        throw error;
      }
    }

    private emitData(data:unknown) {
      if (this.isRecordingVideo) {
        this.$emit("video", data);
      } else {
        this.$emit("audio", data);
      }
    }

    releaseRecord() {
      this.logger.debug("releaseRecord now {}, timeout {}", this.dim, this.timeout)();
      if (this.dim) {
        this.navigatorRecord!.stopRecording();
      } else if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = 0;
        this.isRecordingVideo = !this.isRecordingVideo;
      }
    }

  }
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"

  .icon-webrtc-video, .icon-mic-1
    @extend %chat-icon
    z-index: 2
    right: 30px
</style>
