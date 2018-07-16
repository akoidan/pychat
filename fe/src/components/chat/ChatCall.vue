<template>
  <div id="callContainer">
    <div class="callContainerContent">
      <div class="videoContainer hidden">
        <div class="icon-webrtc-cont"><i class="icon-webrtc-novideo" title="Turn on your webcam"></i><i
            class="icon-webrtc-mic" title="Turn off your microphone"></i><i class="icon-webrtc-minimizedscreen"
                                                                            title="Exit fullscreen"></i><i
            class="icon-webrtc-hangup" title="Hang up"></i><i class="icon-no-desktop"
                                                              title="Capture your desktop screen and start sharing it"></i>
        </div>
        <div>
          <video muted="true" class="localVideo hidden"></video>
        </div>
      </div>
      <table class="settingsContainer hidden">
        <tbody>
        <tr>
          <td><i class="icon-quote-left"></i><span class="callInfo">Call info</span></td>
        </tr>
        <tr>
          <td><i class="icon-volume-2"></i><select></select><span class="playTestSound">Play test sound</span></td>
        </tr>
        <tr>
          <td><i class="icon-videocam"></i><select></select></td>
        </tr>
        <tr>
          <td><i class="icon-mic"></i><select></select></td>
        </tr>
        </tbody>
      </table>
      <div class="callContainerIcons noSelection">
        <i class="icon-phone-circled"></i>
        <i class="icon-mic" title="Turn off your microphone"></i>
        <i class="icon-no-videocam callActiveIcon" title="Turn on your webcam"></i>
        <i class="icon-desktop callActiveIcon" title="Capture your desktop screen and start sharing it"></i>
        <i class="icon-cog"></i>
        <div class="enterFullScreenHolder"><i class="icon-webrtc-fullscreen" title="Fullscreen"></i></div>
        <div class="hangUpHolder hidden"><i class="icon-hang-up callActiveIcon" title="Hang up"></i></div>
        <progress max="15" value="0" title="Your microphone level" class="microphoneLevel"></progress>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class ChatCall extends Vue {

  }
</script>

<style lang="sass" scoped>
</style>