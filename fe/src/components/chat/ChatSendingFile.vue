<template>
  <div class="message-self">
    <chat-message-header
        :time="sendingFile.time"
        :user-id="myId"/>
    <table class="table">
      <tbody>
        <tr>
          <th>Name:</th>
          <td>{{sendingFile.fileName}}</td>
        </tr>
        <tr>
          <th>Size:</th>
          <td>{{size}}</td>
        </tr>
      </tbody>
      <chat-sending-file-transfer :connId="sendingFile.connId" :opponentId="key" v-for="(transfer, key) in sendingFile.transfers" :key="key" :transfer="transfer"/>
    </table>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {SendingFile, UserModel} from "../../types/model";
  import {bytesToSize} from '../../utils/utils';
  import AppProgressBar from '../ui/AppProgressBar';
  import ChatSendingFileTransfer from './ChatSendingFileTransfer';
  import ChatMessageHeader from './ChatMessageHeader';
  @Component({
    components: {ChatMessageHeader, ChatSendingFileTransfer, AppProgressBar}
  })
  export default class ChatSendingFile extends Vue {
    @Prop() sendingFile: SendingFile;
    @Getter myId: number;


    get size() {
      return bytesToSize(this.sendingFile.fileSize)
    }


  }
</script>

<style lang="sass" scoped>
  table /deep/
    width: 100%
    th, td
      text-align: left
    th
      color: #79aeb6
      font-weight: bold
      padding-left: 5px
    td
      padding-left: 10px
      width: 100%
      text-overflow: ellipsis
      max-width: 250px
      overflow: hidden
</style>