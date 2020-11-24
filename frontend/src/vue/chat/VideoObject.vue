<template>
  <video
    ref="video"
    :muted="muted"
  />
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch
} from 'vue-property-decorator';
import { getStreamLog } from '@/ts/utils/pureFunctions';

@Component
export default class VideoObject extends Vue {
  @Prop() public mediaStreamLink!: string;
  @Prop() public muted!: string;
  @Prop() public userId!: number;

  @Ref()
  public video!: HTMLVideoElement

  /*@Watch('mediaStreamLink')
  public onMediaStreamChanged(newValue: string) {
    const stream: MediaStream = this.$store.mediaObjects[newValue];
    this.$logger.log('Video #{} scheduling stream updat-> {} {}', this.userId, newValue, stream)();
    window.setTimeout(() => {
      this.$logger.log('Video #{} updated stream -> {} {}', this.userId, newValue, stream)();
      if (stream) {
        this.video.srcObject = stream;
        this.video.play();
      } else {
        // we should not use src like below, since on safari this would throw en exception by aborting promise in current operation
        // this.video.src = '';
        this.video.srcObject = null;
        this.video.pause();
      }
    }, 100) //
    console.error("REMOVE THIS TRASH"); // if we remove this timeout track won't be display on video object

  }*/

  @Watch('mediaStreamLink')
  public onMediaStreamChanged(newValue: string) {
    const stream: MediaStream = this.$store.mediaObjects[newValue];
    this.$logger.log('Video #{} scheduling stream update-> {} {}', this.userId, newValue, getStreamLog(stream))();
    if (stream) {
        this.video.srcObject = stream;
        this.video.play();
      } else {
        // we should not use src like below, since on safari this would throw en exception by aborting promise in current operation
        // this.video.src = '';
        this.video.srcObject = null;
        this.video.pause();
    }
  }
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

