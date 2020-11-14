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

@Component
export default class VideoObject extends Vue {
  @Prop() public mediaStreamLink!: string;
  @Prop() public muted!: string;

  @Ref()
  public video!: HTMLVideoElement;

  @Watch('mediaStreamLink')
  public onMediaStreamChanged(newValue: string) {
    const stream: MediaStream = this.$store.mediaObjects[newValue];
    this.$logger.log('Media stream changed {} {}', newValue, stream)();
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


</style>

