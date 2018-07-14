<template>
  <div :class="mainClass">
    <chat-message-header
        :time="receivingFile.time"
        :user-id="receivingFile.userId"
    />
    <table class="table">
      <tbody>
      <tr>
        <th>Name:</th>
        <td>{{receivingFile.fileName}}</td>
      </tr>
      <tr>
        <th>Size:</th>
        <td>{{size}}</td>
      </tr>
      <tr>
        <th>Status:</th>
        <td>{{status}}</td>
      </tr>
      <tr v-if="showProgress">
        <td colspan="2">
          <app-progress-bar @retry="retry"  class="progress-wrap-file" :upload="receivingFile"/>
        </td>
      </tr>
      </tbody>
    </table>
    <div class="yesNo" v-if="receivingFile.status === ReceivingFileStatus.NOT_DECIDED_YET">
      <input type="button" value="Accept" @click="accept" class="green-btn">
      <input type="button" value="Decline" @click="decline" class="red-btn">
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {Getter} from 'vuex-class';
  import {ReceivingFile, ReceivingFileStatus} from "../../types/model";
  import {bytesToSize} from "../../utils/utils";
  import AppProgressBar from "../ui/AppProgressBar";
  import ChatMessageHeader from "./ChatMessageHeader";
  import {webrtcApi} from '../../utils/singletons';

  @Component({
    components: {ChatMessageHeader, AppProgressBar}
  })
  export default class ChatReceivingFile extends Vue {
    @Prop() receivingFile: ReceivingFile;
    @Getter myId: number;
    ReceivingFileStatus = ReceivingFileStatus;

    get size() :string {
      return bytesToSize(this.receivingFile.total)
    }
    get showProgress () {
      return ReceivingFileStatus.ERROR === this.receivingFile.status
          || ReceivingFileStatus.IN_PROGRESS === this.receivingFile.status
          || ReceivingFileStatus.FINISHED === this.receivingFile.status;
    }

    get status() {
      switch (this.receivingFile.status) {
        case ReceivingFileStatus.ERROR:
          return 'Error';
        case ReceivingFileStatus.IN_PROGRESS:
          return 'Downloading...';
        case ReceivingFileStatus.DECLINED:
          return 'Declined';
        case ReceivingFileStatus.FINISHED:
          return 'Finished';
        case ReceivingFileStatus.NOT_DECIDED_YET:
          return 'Waiting for approval';
      }
    }

    get mainClass(): string {
      if (this.receivingFile.userId === this.myId) {
        return 'message-self';
      } else {
        return 'message-others';
      }
    }

    accept() {
      webrtcApi.acceptFile(this.receivingFile.connId, this.receivingFile.roomId);
    }

    decline() {
      webrtcApi.declineFile(this.receivingFile.connId, this.receivingFile.roomId);
    }

    retry() {

    }

  }
</script>

<style lang="sass" scoped>
  table
    width: 100%
    th
      color: #79aeb6
      font-weight: bold
    td
      text-overflow: ellipsis
      max-width: 250px
      overflow: hidden

  .progress-wrap-file /deep/ .progress-wrap
    width: 100%
  .yesNo
    padding-top: 15px
    padding-bottom: 5px
    display: flex
    justify-content: space-around
    input[type=button]
      width: 100%
      &:first-child
        margin-right: 10px
</style>