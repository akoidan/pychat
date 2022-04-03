<template>
  <table class="settingsContainer">
    <tbody>
      <tr>
        <td>
          <i class="icon-quote-left"/>
          <span class="callInfo">Call info</span>
        </td>
      </tr>
      <tr>
        <td>
          <i class="icon-volume-2"/>
          <select
            class="input"
            :value="callInfo.currentSpeaker"
            @change="setCurrentSpeakerProxy"
          >
            <option
              v-for="(speaker, id) in speakers"
              :key="id"
              :value="id"
            >
              {{ speaker }}
            </option>
          </select>
          <span
            class="playTestSound"
            @click="playTest"
          >Play test sound</span>
        </td>
      </tr>
      <tr>
        <td>
          <i class="icon-videocam"/>
          <select
            class="input"
            :value="callInfo.currentWebcam"
            @change="setCurrentWebcamProxy"
          >
            <option
              v-for="(webcam, id) in webcams"
              :key="id"
              :value="id"
            >
              {{ webcam }}
            </option>
          </select>
        </td>
      </tr>
      <tr>
        <td>
          <i class="icon-mic"/>
          <select
            class="input"
            :value="callInfo.currentMic"
            @change="setCurrentMicProxy"
          >
            <option
              v-for="(mic, id) in microphones"
              :key="id"
              :value="id"
            >
              {{ mic }}
            </option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {CallsInfoModel} from "@/ts/types/model";
import type {StringIdentifier} from "@/ts/types/types";
import {State} from "@/ts/instances/storeInstance";
import {file} from "@/ts/utils/audio";

@Component({name: "InputDevicesSettings"})
export default class InputDevicesSettings extends Vue {
  @Prop() public callInfo!: CallsInfoModel;

  @Prop() public roomId!: number;

  @State
  public readonly speakers!: Record<string, string>;

  @State
  public readonly webcams!: Record<string, string>;

  @State
  public readonly microphones!: Record<string, string>;

  public setCurrentWebcamProxy(event: Event) {
    const payload: StringIdentifier = {
      id: this.roomId,
      state: (event.target as HTMLInputElement).value,
    };
    this.$store.setCurrentWebcam(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.updateConnection(this.roomId);
    }
  }

  public setCurrentSpeakerProxy(event: Event) {
    const payload: StringIdentifier = {
      id: this.roomId,
      state: (event.target as HTMLInputElement).value,
    };
    this.$store.setCurrentSpeaker(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.updateConnection(this.roomId);
    }
  }

  public setCurrentMicProxy(event: Event) {
    const payload: StringIdentifier = {
      id: this.roomId,
      state: (event.target as HTMLInputElement).value,
    };
    this.$store.setCurrentMic(payload);
    if (this.callInfo.callActive) {
      this.$webrtcApi.updateConnection(this.roomId);
    }
  }

  public playTest() {
    if (file.setSinkId) {
      file.setSinkId(this.callInfo.currentSpeaker!);
      file.pause();
      file.currentTime = 0;
      file.volume = 1;
      const prom = file.play();
      prom && prom.catch((e) => {
      });
    } else {
      this.$store.growlError("Your browser doesn't support changing output channel");
    }
  }
}
</script>

<style scoped lang="sass">
  select
    padding: 5px 5px 5px 25px
  .settingsContainer
    width: 200px
    margin: auto
    .callInfo
      padding-left: 20px
      display: block
    .playTestSound
      color: grey
      display: block
      font-size: 12px
      text-align: left
      padding-left: 10px
      &:hover
        color: #d7d7d7
        cursor: pointer
    td
      position: relative
      padding: 3px
      select
        width: 200px
        padding-left: 30px
      [class^='icon-']
        position: absolute
        top: 7px
        left: 5px
        color: #24768e !important
</style>
