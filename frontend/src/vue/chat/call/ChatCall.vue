<template>
  <div
    v-show="callInfo.callActive"
    class="callContainer"
  >
    <div
      :class="{fullscreen}"
      class="callContainerContent"
    >
      <video-container
        v-show="showVideoContainer && !showSettings && callInfo.callActive"
        ref="videoContainer"
        :call-info="callInfo"
        :room-id="roomId"
        @desktop-click="desktopClick"
        @video-click="videoClick"
        @hang-up-call="hangUpCall"
        @mic-click="micClick"
        @exit-fullscreen="exitFullscreen"
      />

      <input-devices-settings
        v-show="showSettings"
        :call-info="callInfo"
        :room-id="roomId"
      />
      <call-container-icons
        :call-info="callInfo"
        :room-id="roomId"
        @mic-click="micClick"
        @hang-up-call="hangUpCall"
        @video-click="videoClick"
        @paint-click="paintClick"
        @invert-show-settings="invertShowSettings"
        @desktop-click="desktopClick"
        @enter-fullscreen="enterFullscreen"
        @invert-show-video-container="invertShowVideoContainer"
      />
      <div class="spainter">
        <!--        TODO v-if doesn't detach events on destroy on painter-->
        <painter v-if="callInfo.sharePaint" @canvas="onCanvas" @blob="onBlobPaste"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {CallsInfoModel} from "@/ts/types/model";
import type {
  BooleanIdentifier,
  ShareIdentifier,
} from "@/ts/types/types";
import {VideoType} from "@/ts/types/types";

import ChatRemotePeer from "@/vue/chat/call/ChatRemotePeer.vue";
import VideoObject from "@/vue/chat/chatbox/VideoObject.vue";
import InputDevicesSettings from "@/vue/chat/call/InputDevicesSettings.vue";
import VideoContainer from "@/vue/chat/chatbox/VideoContainer.vue";
import CallContainerIcons from "@/vue/chat/call/CallContainerIcons.vue";
import Painter from "@/vue/chat/textarea/Painter.vue";
import {savedFiles} from "@/ts/utils/htmlApi";


let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}


@Component({
  name: "ChatCall",
  components: {
    Painter,
    CallContainerIcons,
    VideoContainer,
    InputDevicesSettings,
    VideoObject,
    ChatRemotePeer,
  },
})
export default class ChatCall extends Vue {
  @Prop() public callInfo!: CallsInfoModel;

  @Prop() public roomId!: number;

  public showSettings: boolean = false;

  public showVideoContainer: boolean = true;

  @Ref()
  public videoContainer!: Vue;

  @State
  public readonly activeRoomId!: number;

  @State
  public readonly myId!: number;

  public fullscreen: boolean = false;

  public listener: EventListenerOrEventListenerObject | null = null;

  @Watch("callInfo.callActive")
  onCallActive(newValue: boolean) {
    if (newValue) {
      this.showVideoContainer = true;
    }
  }

  onBlobPaste(e: Blob) {
    const id: string = `paintBlob-${getUniqueId()}`;
    savedFiles[id] = e;
    this.$store.setPastingQueue([
      {
        content: id,
        editedMessageId: null,
        elType: "blob",
        openedThreadId: null,
        roomId: this.activeRoomId,
      },
    ]);
  }

  onCanvas(canvas: HTMLCanvasElement) {
    this.$webrtcApi.setCanvas(this.roomId, canvas);
    if (this.callInfo.callActive) {
      this.$webrtcApi.toggleDevice(this.roomId, VideoType.PAINT);
    }
  }

  invertShowSettings() {
    this.showSettings = !this.showSettings;
  }

  public invertShowVideoContainer() {
    this.showVideoContainer = !this.showVideoContainer;
  }

  public fullScreenChange() {
    this.$logger.log("fs change")();
    if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement || document.msFullscreenElement)) {
      this.fullscreen = false;
    }
  }

  public created() {
    // if bind would be called inside class definition
    // public listener = this.fullScreenChange.bind(this);
    // this object somehow wouldn't have global fields (e.g. from global mixins)
    // this is why listener should be here
    this.listener = this.fullScreenChange.bind(this);
    ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"].forEach((e) => {
      document.addEventListener(e, this.listener!, false);
    });
  }

  public destroyed() {
    ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"].forEach((e) => {
      document.removeEventListener(e, this.listener!, false);
    });
  }

  public enterFullscreen() {
    const elem: HTMLElement = this.videoContainer.$el as HTMLElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else {
      this.$store.growlError("Can't enter fullscreen");

      return;
    }
    this.fullscreen = true;
  }

  public desktopClick() {
    const payload: ShareIdentifier = {
      state: !this.callInfo.shareScreen,
      id: this.roomId,
      type: "desktop",
    };
    this.$store.setVideoToState(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.toggleDevice(this.roomId, VideoType.SHARE);
    }
  }

  public paintClick() {
    const payload: ShareIdentifier = {
      state: !this.callInfo.sharePaint,
      id: this.roomId,
      type: "paint",
    };
    this.$store.setVideoToState(payload);
    if (this.callInfo.callActive && !this.callInfo.sharePaint) {
      this.$webrtcApi.toggleDevice(this.roomId, VideoType.PAINT);
    }
  }

  public videoClick() {
    const payload: ShareIdentifier = {
      state: !this.callInfo.showVideo,
      id: this.roomId,
      type: "webcam",
    };
    this.$store.setVideoToState(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.toggleDevice(this.roomId, VideoType.VIDEO);
    }
  }

  public micClick() {
    const payload: BooleanIdentifier = {
      state: !this.callInfo.showMic,
      id: this.roomId,
    };
    this.$store.setMicToState(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.toggleDevice(this.roomId, VideoType.AUDIO);
    }
  }

  public hangUpCall() {
    this.$webrtcApi.hangCall(this.roomId);
    this.fullscreen = false;
    this.exitFullscreen();
  }

  public exitFullscreen() {

    /*
     * TODO if doesn't work in chrome 86, when multiple monitors (if that's relevant):(
     * if (typeof screen != 'undefined' && screen.height === window.innerHeight) {
     */
    if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msCancelFullScreen) {
      document.msCancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.cancelFullScreen) {
      document.cancelFullScreen(); // This should go last, webkit cancel seems to work better than simple one
    }
    // }
    this.fullscreen = false;
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"


.callContainer
  border-right: 7.5px solid #1a1a1a
  display: inline-block
  max-width: 100%
  max-height: calc(100% - 160px)
  text-align: center

  :deep(label)
    cursor: pointer

  :deep(.icon-mic), :deep(.icon-videocam), :deep(.activeIcon), :deep(.icon-phone-circled)
    cursor: pointer
    @include hover-click(#3aa130)

  :deep(.icon-mute), :deep(.icon-no-videocam), :deep(.noactiveIcon), :deep(.icon-hang-up)
    cursor: pointer
    @include hover-click(#c72727)

  :deep(.icon-cog), :deep(.icon-webrtc-fullscreen), :deep(.icon-popup)
    cursor: pointer
    @include hover-click(#2a8f9c)


.fullscreen
  :deep(.videoContainer)
    background-color: black

  :deep(.micVideoWrapper > video)
    max-height: 99vh
    height: 99vh

  :deep(.videoContainer video)
    border-color: #272727

  :deep(.icon-webrtc-cont)
    display: block

.callContainerContent
  padding: 0
  // it should not have padding otherwise we would have scroll in painter container
  display: flex
  height: 100%
  flex-direction: column
  min-width: 150px

.spainter
  padding: 10px
  min-height: 0
  @media screen and (max-height: 850px)
    :deep(.painterTools)
      width: 60px !important
      flex-direction: row !important
      flex-wrap: wrap
  @media screen and (max-height: 650px)
    :deep(.painterTools)
      width: 80px !important
      flex-direction: row !important
      flex-wrap: wrap

  :deep(*div)
    height: 100%

  :deep(.active-icon)
    color: red

  :deep(.toolsAndCanvas)
    height: 100%

</style>
