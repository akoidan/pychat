<template>
  <div class="incomingCall">
    <div>
      <table class="table">
        <tbody>
          <tr>
            <th>From:</th>
            <td>{{ caller }}</td>
          </tr>
          <tr>
            <th>Room:</th>
            <td>{{ room }}</td>
          </tr>
        </tbody>
      </table>
      <div class="answerButtons">
        <button
          class="green-btn"
          @click="answer"
        >
          <i class="icon-call-aswer"/>
          <div>Answer</div>
        </button>
        <button
          class="green-btn"
          @click="videoAnswer"
        >
          <i class="icon-videocam"/>
          <div>With video</div>
        </button>
        <button
          class="red-btn"
          @click="hangUp"
        >
          <i class="icon-hang-up"/>
          <div>Decline</div>
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import type {UserModel} from "@/ts/types/model";
import {
  IncomingCallModel,
  RoomDictModel,
} from "@/ts/types/model";


@Component({name: "IncomingCall"})
export default class IncomingCall extends Vue {
  @Prop() public call!: IncomingCallModel;

  @State
  public readonly allUsersDict!: Record<number, UserModel>;

  @State
  public readonly roomsDict!: RoomDictModel;

  get caller() {
    return this.allUsersDict[this.call.userId].user;
  }

  get room(): string {
    return this.roomsDict[this.call.roomId].name;
  }

  public answer() {
    this.$webrtcApi.answerCall(this.call.connId);
  }

  public hangUp() {
    this.$webrtcApi.declineCall(this.call.connId);
  }

  public videoAnswer() {
    this.$webrtcApi.videoAnswerCall(this.call.connId);
  }
}
</script>

<style lang="sass" scoped>
  .incomingCall
    z-index: 1
    position: absolute
    top: 0
    display: flex
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.3)
    align-items: center
    justify-content: center
    > div
      background-color: #000000
      padding: 15px
      border-radius: 5px
      border: 1px solid green

  button
    div
      display: inline-block

  table
    width: 100%
    th
      color: #79aeb6
      width: 80px
      text-align: left
      font-weight: bold
    td
      text-overflow: ellipsis
      max-width: 250px
      overflow: hidden
</style>
