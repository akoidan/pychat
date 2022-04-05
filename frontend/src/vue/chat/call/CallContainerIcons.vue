<template>
  <div class="callContainerIcons">
    <div v-if="callInfo.callActiveButNotJoinedYet" class="call-is-active">
      Call in this room is active already
    </div>
    <div class="callContainerIconsInner">
      <button v-if="callInfo.callActiveButNotJoinedYet" class="green-btn" @click="joinCall">
        Join call
      </button>
      <i
        :class="iconMicClass"
        :title="micTitle"
        @click="micClick"
      />
      <i
        :class="iconVideoClass"
        :title="videoTitle"
        @click="videoClick"
      />
      <i
        :class="callInfo.shareScreen ? 'activeIcon' : 'noactiveIcon'"
        class="icon-desktop"
        title="Capture your desktop screen and start sharing it"
        @click="desktopClick"
      />
      <i
        :class="callInfo.sharePaint ? 'activeIcon' : 'noactiveIcon'"
        class="icon-brush"
        title="Share painter canvas"
        @click="paintClick"
      />
      <i
        v-show="callInfo.callActive"
        class="icon-popup"
        title="Hide/Show videos"
        @click="invertShowVideoContainer"
      />
      <i
        class="icon-cog"
        @click="invertShowSettings"
      />
      <i
        v-show="callInfo.callActive"
        class="icon-webrtc-fullscreen"
        title="Fullscreen"
        @click="enterFullscreen"
      />
      <div
        v-show="callInfo.callActive"
        class="hangUpHolder"
      >
        <i
          class="icon-hang-up"
          title="Hang up"
          @click="hangUpCall"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Vue,
} from "vue-property-decorator";
import {CallsInfoModel} from "@/ts/types/model";

@Component({name: "CallContainerIcons"})
export default class CallContainerIcons extends Vue {
  @Prop() public callInfo!: CallsInfoModel;

  @Prop() public roomId!: number;

  public get videoTitle() {
    return `Turn ${this.callInfo.showVideo ? "off" : "on"} your webcam`;
  }

  public get micTitle() {
    return `Turn ${this.callInfo.showMic ? "off" : "on"} your microphone`;
  }

  public get iconVideoClass(): {} {
    return {
      "icon-no-videocam": !this.callInfo.showVideo,
      "icon-videocam": this.callInfo.showVideo,
    };
  }

  public get iconMicClass(): {} {
    return {
      "icon-mic": this.callInfo.showMic,
      "icon-mute": !this.callInfo.showMic,
    };
  }

  @Emit()
  public micClick(): void {
  }

  @Emit()
  public hangUpCall(): void {
  }

  @Emit()
  public videoClick(): void {
  }

  @Emit()
  public desktopClick(): void {
  }

  @Emit()
  public invertShowSettings(): void {
  }

  @Emit()
  public enterFullscreen(): void {
  }

  @Emit()
  public paintClick(): void {
  }

  @Emit()
  public invertShowVideoContainer(): void {
  }

  public joinCall(): void {
    this.$webrtcApi.joinCall(this.roomId);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
@import "@/assets/sass/partials/mixins"

.call-is-active
  font-size: 10px

.icon-webrtc-fullscreen
  padding-top: 1px
  margin-bottom: -1px
  transform: scale(2)

.callContainerIcons
  display: flex
  flex-direction: column
  font-size: 25px
  @extend %user-select-none
  width: 100%
  padding-top: 10px

  .callContainerIconsInner
    display: flex
    margin: auto
    justify-content: space-between

    > *
      margin: 0 5px

  .hangUpHolder
    display: inline-block
    position: relative
    width: 46px
    height: 28px
    margin-left: 10px
    margin-top: -7px

    .icon-hang-up
      position: absolute
      font-size: 35px
      top: 0
      left: 0

</style>
