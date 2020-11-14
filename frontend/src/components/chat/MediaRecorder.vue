<template>
  <div
    @contextmenu.prevent
    @drag.prevent
    v-switcher="{start: startRecord, stop: releaseRecord, switch: switchRecord, activeFlag: dim}"
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

import { State } from '@/utils/storeHolder';
import {
  Component,
  Vue
} from "vue-property-decorator";
import MediaCapture from '@/utils/MediaCapture';

import {
  isChrome,
  isMobile
} from '@/utils/runtimeConsts';


@Component
  export default class MediaRecorder extends Vue {

    isRecordingVideo = true;
    @State
    public readonly dim!: boolean;

    navigatorRecord: MediaCapture|null = null;


    switchRecord() {
      this.isRecordingVideo = !this.isRecordingVideo;
    }

    async startRecord() {
      this.$logger.debug("Starting recording... {}")();
      this.$store.setDim(true);
      this.navigatorRecord = new MediaCapture(this.isRecordingVideo, this.$platformUtil);
      try {
        let src: MediaStream = (await this.navigatorRecord.record())!;
        this.$emit("record", {isVideo: this.isRecordingVideo, src: src});
      } catch (error) {
        this.$store.setDim(false);
        this.emitData(null);
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
      if (this.isRecordingVideo) {
        this.$emit("video", data);
      } else {
        this.$emit("audio", data);
      }
    }

    async releaseRecord() {
      this.$store.setDim(false);
      let data: Blob|null = await this.navigatorRecord!.stopRecording();
      this.$logger.debug("Finishing recording... {}", data)();
      if (data) {
        this.emitData(data);
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
