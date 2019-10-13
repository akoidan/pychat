<template>
    <video :muted="muted" ref="video" ></video>
</template>

<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue, Watch, Ref} from "vue-property-decorator";

  @Component
  export default class VideoObject extends Vue {
    @Prop() mediaStreamLink!: string;
    @Prop() muted!: string;

    @Ref()
    video!: HTMLVideoElement;


    @Watch("mediaStreamLink")
    onMediaStreamChanged(newValue: string) {
      let stream: MediaStream = this.store.mediaObjects[newValue];
      this.logger.log("Media stream changed {} {}", newValue, stream)();
      if (stream) {
        this.video.srcObject = stream;
        this.video.play();
      } else {
        this.video.src = '';
        this.video.srcObject = null;
        this.video.pause();
      }
    }
  }
</script>
<style lang="sass" scoped>


</style>

