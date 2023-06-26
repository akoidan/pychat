<template>
  <video
    ref="video"
    :class="{connected}"
    :muted="muted"
  />
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {getStreamLog} from "@/ts/utils/pureFunctions";

@Component({name: "VideoObject"})
export default class VideoObject extends Vue {
  @Prop() public mediaStreamLink!: string;

  @Prop() public muted!: boolean;

  @Prop() public userId!: number;

  @Prop() public connected!: boolean;

  @Ref()
  public video!: HTMLVideoElement;

  get $noVerbose(): true {
    return true;
  }

  /*
   *@Watch('mediaStreamLink')
   *public onMediaStreamChanged(newValue: string) {
   *const stream: MediaStream = this.$store.mediaObjects[newValue];
   *this.$logger.log('Video #{} scheduling stream updat-> {} {}', this.userId, newValue, stream)();
   *window.setTimeout(() => {
   *  this.$logger.log('Video #{} updated stream -> {} {}', this.userId, newValue, stream)();
   *  if (stream) {
   *    this.video.srcObject = stream;
   *    this.video.play();
   *  } else {
   *    // we should not use src like below, since on safari this would throw en exception by aborting promise in current operation
   *    // this.video.src = '';
   *    this.video.srcObject = null;
   *    this.video.pause();
   *  }
   *}, 100) //
   *console.error("REMOVE THIS TRASH"); // if we remove this timeout track won't be display on video object
   *
   *}
   */

  @Watch("connected")
  public onConnectedChanged(newValue: boolean) {
    this.$logger.debug("Changed connected to {}", newValue)();
    if (!newValue) {
      this.video.srcObject = null;
    } else {
      this.video.srcObject = this.$store.mediaObjects[this.mediaStreamLink];
    }
  }

  @Watch("mediaStreamLink")
  public onMediaStreamChanged(newValue: string) {
    const stream: MediaStream = this.$store.mediaObjects[newValue];
    this.$logger.debug("Video #{} scheduling stream update-> {} {}", this.userId, newValue, getStreamLog(stream))();
    if (stream) {
      this.video.srcObject = stream;
      this.video.play();
    } else {

      /*
       * We should not use src like below, since on safari this would throw en exception by aborting promise in current operation
       * this.video.src = '';
       */
      this.video.srcObject = null;
      this.video.pause();
    }
  }

  /*
   * Private timeout: number = 0;
   *
   * @Watch('mediaStreamLink')
   * public onMediaStreamChanged(newValue: string) {
   *   const stream: MediaStream = this.$store.mediaObjects[newValue];
   *   this.$logger.debug('Video #{} scheduling stream update-> {} {}', this.userId, newValue, getStreamLog(stream))();
   *   if (this.timeout) {
   *     clearTimeout(this.timeout);
   *   }
   *   this.$logger.log("Scgedykubg settubgs vudei src")();
   *   this.timeout = setTimeout(() => {
   *     this.$logger.log("Firing setting video src")();
   *     if (stream) {
   *       this.video.srcObject = stream;
   *       this.video.play();
   *     } else {
   *       // we should not use src like below, since on safari this would throw en exception by aborting promise in current operation
   *       // this.video.src = '';
   *       this.video.srcObject = null;
   *       this.video.pause();
   *     }
   *   }, 1000)
   * }
   */
}
</script>
<style lang="sass" scoped>

video
  max-height: calc(60vh - 120px)
  max-width: 100%
  background-color: #630000

  &.connected
    background-color: #165620
</style>

