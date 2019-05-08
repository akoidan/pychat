<template>
  <div @contextmenu.prevent @drag.prevent @mouseup="releaseRecord" @mouseout="releaseRecord" @mousedown="switchRecord" @touchstart="switchRecord" @touchend="releaseRecord">
    <i class="icon-webrtc-video" title="Hold on to send video" v-show="isRecordingVideo"></i>
    <i class="icon-mic-1" title="Hold on to send audio" v-show="!isRecordingVideo"></i>
  </div>
</template>
<script lang="ts">
  import
  {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {stopVideo} from '../../utils/htmlApi';
  import MediaCapture from '../../utils/MediaCapture';
  import {isChrome, isMobile} from "../../utils/singletons";

  const HOLD_TIMEOUT = 500;

  declare var MediaRecorder: any;

  @Component
  export default class MediaRecorderDiv extends Vue {

    @Mutation setDim;
    @Action growlError;
    isRecordingVideo = true;
    @State dim: boolean;

    // started: number = null;
    timeout: number = 0;
    navigatorRecord: MediaCapture;


    switchRecord() {
      this.logger.debug("switch recrod...")();
      // this.started = Date.now();
      this.timeout = setTimeout(() => {
        this.startRecord();
        this.logger.debug("switch record timeouted...")();
        this.timeout = null;
      }, HOLD_TIMEOUT);
    }

    startRecord() {
      this.logger.debug("Starting recording...")();
      this.setDim(true);
      this.navigatorRecord = new MediaCapture(this.isRecordingVideo, (data) => {
        this.logger.debug("Finishing recording... {}", data)();
        this.setDim(false);
        if (data) {
          this.emitData(data);
        }
      });
      this.navigatorRecord.record().then((src: MediaStream) => {
        this.logger.debug("Resolved record emitting video")();
        this.$emit("record", {isVideo: this.isRecordingVideo, src: src});
      }).catch(error => {
        this.setDim(false);
        this.emitData(null);
        if (String(error).indexOf("Permission denied") >= 0) {
          if (isChrome && !isMobile) {
            this.growlError(`Please allow access for ${document.location.origin} in chrome://settings/content/microphone`);
          } else {
            this.growlError(`You blocked the access to microphone/video. Please Allow it to continue`);
          }
        } else {
          this.growlError("Unable to capture input device because " + error);
        }
        this.logger.error("Error during capturing media {}", error);
        this.navigatorRecord.stopRecording();
        throw error;
      })
    }

    private emitData(data) {
      if (this.isRecordingVideo) {
        this.$emit("video", data);
      } else {
        this.$emit("audio", data);
      }
    }

    releaseRecord() {
      this.logger.debug("releaseRecord now {}, timeout {}", this.dim, this.timeout)();
      if (this.dim) {
        this.navigatorRecord.stopRecording();
      } else if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
        this.isRecordingVideo = !this.isRecordingVideo;
      }
    }

  }
</script>

<style lang="sass" scoped>
  @import "partials/abstract_classes"

  .icon-webrtc-video, .icon-mic-1
    @extend %chat-icon
    z-index: 2
    right: 30px
</style>
