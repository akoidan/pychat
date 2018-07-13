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
        <td colspan="2">
          <app-progress-bar @retry="retry" :upload="receivingFile"/>
        </td>
      </tr>
      </tbody>
    </table>
    <div class="yesNo">
      <input type="button" value="Accept" class="green-btn">
      <input type="button" value="Decline" class="red-btn">
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {Getter} from 'vuex-class';
  import {ReceivingFile} from "../../types/model";
  import {bytesToSize} from "../../utils/utils";
  import AppProgressBar from "../ui/AppProgressBar";
  import ChatMessageHeader from "./ChatMessageHeader";

  @Component({
    components: {ChatMessageHeader, AppProgressBar}
  })
  export default class ChatSendingFile extends Vue {
    @Prop() receivingFile: ReceivingFile;
    @Getter myId: number;

    get size() :string {
      return bytesToSize(this.receivingFile.total)
    }

    get mainClass(): string {
      if (this.receivingFile.userId === this.myId) {
        return 'message-self';
      } else {
        return 'message-others';
      }
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

  .yesNo
    padding-top: 15px
    display: flex
    justify-content: space-around
    input[type=button]
      width: 100%
      &:first-child
        margin-right: 10px
</style>