<template>
    <video :muted="muted" ref="video" ></video>
</template>

<script lang="ts">
  import {store, State} from '@/utils/storeHolder';
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";

  @Component
  export default class VideoObject extends Vue {
    @Prop() mediaStreamLink: string;
    @Prop() muted: string;

    $refs: {
      video: HTMLVideoElement
    }


    @Watch("mediaStreamLink")
    onMediaStreamChanged(newValue) {
      let stream: MediaStream = store.mediaObjects[newValue];
      this.logger.log("Media stream changed {} {}", newValue, stream)();
      if (stream) {
        this.$refs.video.srcObject = stream;
        this.$refs.video.play();
      } else {
        this.$refs.video.src = '';
        this.$refs.video.srcObject = null;
        this.$refs.video.pause();
      }
    }
  }
</script>
<style lang="sass" scoped>


</style>

