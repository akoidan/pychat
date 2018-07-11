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

  const HOLD_TIMEOUT = 500;

  declare var MediaRecorder: any;

  @Component
  export default class MediaRecorderDiv extends Vue {

    @Mutation setDim;
    isRecordingVideo = true;
    @State dim: boolean;

    // started: number = null;
    timeout: number = 0;
    @Prop() value: string;
    @Prop() videoRef: HTMLVideoElement;
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
        this.videoRef.pause();
        if (data) {
          this.$emit('video', data);
        }
      });
      this.navigatorRecord.record().then((srcVideo: string) => {
        this.logger.debug("Resolved record emitting video")();
        this.$emit("input", srcVideo);
        this.videoRef.play();
      }).catch(error => this.logger.error("Error during capturing media {}", error))
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