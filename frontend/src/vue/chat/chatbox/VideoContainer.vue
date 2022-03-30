<template>
  <div
    class="videoContainer"
  >
    <div class="icon-webrtc-cont">
      <i
        class="icon-webrtc-novideo"
        :class="callInfo.showVideo ? 'activeIcon' : 'noactiveIcon'"
        title="Turn on your webcam"
        @click="videoClick"
      />
      <i
        class="icon-webrtc-mic"
        :class="callInfo.showMic ? 'activeIcon' : 'noactiveIcon'"
        title="Turn off your microphone"
        @click="micClick"
      />
      <i
        class="icon-webrtc-minimizedscreen"
        title="Exit fullscreen"
        @click="exitFullscreen"
      />
      <i
        class="icon-webrtc-hangup"
        title="Hang up"
        @click="hangUpCall"
      />
      <i
        class="icon-no-desktop"
        :class="callInfo.shareScreen ? 'activeIcon' : 'noactiveIcon'"
        title="Capture your desktop screen and start sharing it"
        @click="desktopClick"
      />
    </div>
    <div class="micVideoHolder">
      <template v-for="(call, id) in callInfo.calls">
        <chat-remote-peer
          v-if="call.connected"
          :key="id"
          :call-info="call"
          :class="{'current-video-active': id === currentVideoActive, 'current-video-inactive': currentVideoActive && currentVideoActive !== id}"
          @click.native="setCurrentVideo(id)"
        />
      </template>
      <video-object
        ref="localVideo"
        muted="muted"
        v-show="!currentVideoActive"
        :media-stream-link="callInfo.mediaStreamLink"
        :user-id="myId"
        class="localVideo"
      />
    </div>
    <progress
      max="15"
      :value="callInfo.currentMicLevel"
      title="Your microphone level"
      class="microphoneLevel"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Ref,
  Vue,
  Watch
} from "vue-property-decorator";
import { State } from '@/ts/instances/storeInstance';
import { CallsInfoModel } from '@/ts/types/model';
import VideoObject from '@/vue/chat/chatbox/VideoObject.vue';
import ChatRemotePeer from '@/vue/chat/call/ChatRemotePeer.vue';


@Component({
  name: 'VideoContainer' ,
  components: {ChatRemotePeer, VideoObject}
})
export default class VideoContainer extends Vue {

  @Ref()
  public localVideo!: VideoObject;

  public currentVideoActive: string|null = null;

  @State
  public readonly myId!: number;

  @Prop()
  public callInfo!: CallsInfoModel;

  @Prop()
  public roomId!: number;

  @Emit() micClick() {}
  @Emit() hangUpCall() {}
  @Emit() videoClick() {}
  @Emit() desktopClick() {}
  @Emit() exitFullscreen() {}

  @Watch('callInfo.currentSpeaker')
  public onSpeakerChange(newValue: string) {
    this.$nextTick(function () {
      const video: HTMLVideoElement = this.localVideo.$refs.video as HTMLVideoElement;
      if (video.setSinkId) {
        video.setSinkId(newValue);
      } else  {
        this.$logger.error('SetSinkId doesn\'t exist')();
      }
    });
  }

  public setCurrentVideo(id: string) {
    if (this.currentVideoActive === id) {
      this.currentVideoActive = null;
    } else {
      this.currentVideoActive = id;
    }
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "@/assets/sass/partials/mixins.sass"

  .icon-webrtc-cont
    display: none
    z-index: 1 // override webrtc fullscreen z-index
    position: absolute

    bottom: 2vh
    left: 2vw
    i:hover, .icon-webrtc-mic, .icon-webrtc-video, .icon-desktop
      &:before
        opacity: 1
        color: white
        box-shadow: 6px 6px 36px #666
    .activeIcon:before
      background-color: rgba(88, 143, 255, 0.6)
    i.icon-desktop, i.icon-no-desktop
      font-size: 25px
      &:before
        padding-top: 13px !important
        padding-bottom: 3px !important
    i.icon-webrtc-hangup:hover:before
      background: rgba(217, 24, 24, 0.6)
    > i
      display: block
      font-size: 36px
      opacity: 1
      cursor: pointer

      &:before
        border-radius: 50%
        width: 36px
        height: 36px
        padding: 8px
        background: rgba(102, 102, 102, 0.6)
        text-align: center
        box-shadow: 3px 3px 12px #444
        color: white
        margin: 7px 30px 15px 7px

  =microphone-after
    background-color: rgb(28, 30, 29)
    border-radius: 3px

  =microphone-progress
    border-radius: 3px 0 0 3px

  progress
    bottom: 0
    position: absolute

  .videoContainer
    min-height: 100px
    flex-shrink: 0
    position: relative
    width: 100%
    text-align: center

    video
      background: #272C2D
      border: 1px solid grey

  .current-video-active
    width: 100% !important
    height: 100% !important
    max-width: 100% !important
    max-height: 100% !important
  .current-video-inactive
    display: none !important


  .inactive .icon-webrtc-cont > i
    transform: translateX(calc(-2vw - 70px))
    @include transition(all 0.1s ease-in-out)

  .microphoneLevel
    display: flex
    $color: #4b9637
    $height: 6px
    $transition-time: all 0.1s
    height: $height
    @include appearance(none)
    width: 100%
    background-size: auto
    border: solid 1px
    box-shadow: 0 1px 1px rgba(250, 255, 253, 0.2),  inset 0 1px 1px rgba(0, 0, 0, 0.41)
    border-color: #0c0d0f #1b1c1e #222423
    +microphone-after
    &::-webkit-progress-value
      background-image: -webkit-linear-gradient(darken($color, 20%), lighten($color, 15%) 30%, darken($color, 15%) 100%)
      -webkit-transition: $transition-time
      +microphone-progress
    &::-moz-progress-bar
      background-image: -moz-linear-gradient(darken($color, 20%), lighten($color, 15%) 30%, darken($color, 15%) 100%)
      -moz-transition: $transition-time
      +microphone-progress
    &::-webkit-progress-bar
      +microphone-after
      border: none
    @-moz-document url-prefix()
      height: $height - 2px
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
  .localVideo
    position: absolute
    max-width: 35%
    max-height: 35%
    background: #555
    margin-bottom: 4px

  .micVideoHolder ::v-deep
    @mixin selectIfHasAmountOfChild($child) // renders style depending on amount of children
      $realChild: $child +1
      // select first element, and nth element from the end
      // if it's the same element, e.g. 321 , if 3rd element from the end = first element then container has 3 elements
      // note selector applies to all siblings with class .micVideoWrapper
      .micVideoWrapper:first-child:nth-last-child(#{$realChild}), .micVideoWrapper:first-child:nth-last-child(#{$realChild}) ~ .micVideoWrapper
        @content

    @mixin selectVideoIfhasAmountOfChild($child) // renders style depending on amount of children
      $realChild: $child +1
      .micVideoWrapper:first-child:nth-last-child(#{$realChild}) ~ video
        @content

    @mixin selectNthIfHasAmountOfChildren($amountOfChild, $nth)
      .micVideoWrapper:first-child:nth-last-child(#{$amountOfChild +1}) ~ .micVideoWrapper:nth-child(#{$nth})
        @content

    //default
    .micVideoWrapper
      max-width: calc(33% - 5px)

    //1
    @include selectIfHasAmountOfChild(1)
      max-width: 100%

    @include selectVideoIfhasAmountOfChild(1)
      bottom: 0
      right: 0
    //2
    @include selectIfHasAmountOfChild(2)
      max-width: calc(50% - 5px)

    @include selectVideoIfhasAmountOfChild(2)
      bottom: 0
      left: 50%
      transform: translateX(-50%)

    //3
    @include selectIfHasAmountOfChild(3)
      max-width: calc(50% - 5px)
      display: table-cell

    @include selectVideoIfhasAmountOfChild(3)
      bottom: 0
      right: 0

    @include selectNthIfHasAmountOfChildren(3,3)
      margin-right: calc(50% - 2px)

    //4
    @include selectIfHasAmountOfChild(4)
      max-width: calc(50% - 5px)
      display: inline-block

    @include selectVideoIfhasAmountOfChild(4)
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)

    //5
    @include selectIfHasAmountOfChild(5)
      max-width: calc(50% - 5px)
      display: inline-block

    @include selectNthIfHasAmountOfChildren(5,5)
      margin-right: calc(50% - 2px)

    @include selectVideoIfhasAmountOfChild(5)
      right: 0
      bottom: 0

    //6
    @include selectIfHasAmountOfChild(6)
      max-width: calc(50% - 5px)
      display: inline-block

    @include selectVideoIfhasAmountOfChild(6)
      left: 50%
      transform: translateX(-50%)
      bottom: 0

    //7
    @include selectIfHasAmountOfChild(7)
      max-width: calc(33% - 6px)
      display: inline-block

    @include selectVideoIfhasAmountOfChild(7)
      right: 0
      bottom: 0

    @include selectNthIfHasAmountOfChildren(7, 7)
      margin-right: calc(66% - 4px)

    //8
    @include selectIfHasAmountOfChild(8)
      max-width: calc(33% - 6px)
      display: inline-block

    @include selectVideoIfhasAmountOfChild(8)
      right: 0
      bottom: 0

    @include selectNthIfHasAmountOfChildren(8,8)
      margin-right: calc(33% - 2px)

    //9
    @include selectIfHasAmountOfChild(9)
      max-width: calc(33% - 6px)
      display: inline-block

    @include selectVideoIfhasAmountOfChild(9)
      left: 33%
      max-height: 20%
      transform: translateX(-50%)
      bottom: 0
</style>
