<template>
  <div class="callContainerIcons">
    <div class="callContainerIconsInner">
      <i
        v-show="!callInfo.callActive"
        class="icon-phone-circled"
        @click="startCall"
      />
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
        class="icon-desktop"
        :class="callInfo.shareScreen ? 'activeIcon' : 'noactiveIcon'"
        title="Capture your desktop screen and start sharing it"
        @click="desktopClick"
      />
      <i
        class="icon-cog"
        @click="invertShowSettings"
      />
      <div
        v-show="callInfo.callActive"
        class="enterFullScreenHolder"
        @click="enterFullscreen"
      >
        <i
          class="icon-webrtc-fullscreen"
          title="Fullscreen"
        />
      </div>
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
  Prop,
  Vue,
  Watch,
  Ref,
  Emit
} from "vue-property-decorator";
import { CallsInfoModel } from '@/ts/types/model';

@Component
export default class CallContainerIcons extends Vue {
  @Prop() public callInfo!: CallsInfoModel;
  @Prop() public roomId!: number;

  @Emit() micClick() {}
  @Emit() hangUpCall() {}
  @Emit() videoClick() {}
  @Emit() desktopClick() {}
  @Emit() invertShowSettings() {}
  @Emit() enterFullscreen() {}

  get videoTitle() {
    return `Turn ${this.callInfo.showVideo ? 'off' : 'on'} your webcam`;
  }

  get micTitle() {
    return `Turn ${this.callInfo.showMic ? 'off' : 'on'} your microphone`;
  }

  get iconVideoClass (): {} {
    return {
      'icon-no-videocam': !this.callInfo.showVideo,
      'icon-videocam': this.callInfo.showVideo
    };
  }

  get iconMicClass (): {} {
    return {
      'icon-mic': this.callInfo.showMic,
      'icon-mute': !this.callInfo.showMic
    };
  }

  public startCall() {
    this.$webrtcApi.startCall(this.roomId);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins.sass"
  .enterFullScreenHolder
    position: relative
    display: inline
    margin-left: 20px
    padding-left: 5px
  .icon-webrtc-fullscreen
    position: absolute
    left: -30px
    font-size: 40px
    top: -10px

  .callContainerIcons
    display: flex
    flex-direction: column
    font-size: 25px
    @extend %user-select-none
    width: 100%
    padding-top: 10px

    .callContainerIconsInner
      display: flex
      justify-content: space-between

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