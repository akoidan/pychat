<template>
  <div class="micVideoWrapper">
    <video-object
        :connected="callInfo.connected"
        :media-stream-link="callInfo.mediaStreamLink"
        :muted="null"
        :user-id="callInfo.userId"
    />
    <div>
      <app-input-range
          :class="volLevelClass"
          :value="volumeLevel"
          max="100"
          min="0"
          title="Volume level"
      />
      <span>{{ userNameValue }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import { CallInfoModel } from "@/ts/types/model";
import AppInputRange from "@/vue/ui/AppInputRange.vue";
import VideoObject from "@/vue/chat/chatbox/VideoObject.vue";

@Component({
  name: "ChatRemotePeer",
  components: {
    VideoObject,
    AppInputRange
  },
})
export default class ChatRemotePeer extends Vue {
  @Ref()
  public video!: VideoObject;

  @Prop() public callInfo!: CallInfoModel;
  public volumeLevel: number = 100;

  get userNameValue(): string {
    return this.$store.userName(this.callInfo.userId);
  }

  get volLevelClass() {
    return `vol-level-${this.callInfo.opponentCurrentVoice}`;
  }

  @Watch("volumeLevel")
  public onVolumeChanged(newValue: number) {
    (this.video.$refs.video as HTMLVideoElement).volume = newValue / 100;
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"

.micVideoWrapper
  display: inline-block
  position: relative
  margin: 1px
  $color: rgba(24, 24, 25, 0.82)

  %asbolute
    z-index: 1
    position: absolute
    background-color: $color
    box-shadow: 0 0 6px 6px $color
    border-radius: 6px
    display: none

  > div
    @extend %asbolute
    bottom: 5px
    left: calc(50% - 55px)

  > span
    @extend %asbolute
    top: calc(5px + 10%)
    font-size: 20px
    left: 50%
    transform: translateX(-50%)

  &:hover
    div, span
      display: block


</style>
