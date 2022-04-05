<template>
  <chat-message-wrapper :time="sendingFile.time" class="message-self">
    <template #header>
      <chat-message-header
        :user-id="myId"
      />
    </template>
    <table class="table">
      <tbody>
        <tr>
          <th>Name:</th>
          <td>{{ sendingFile.fileName }}</td>
        </tr>
        <tr>
          <th>Size:</th>
          <td>{{ size }}</td>
        </tr>
      </tbody>
      <chat-sending-file-transfer
        v-for="(transfer, key) in sendingFile.transfers"
        :key="key"
        :conn-id="sendingFile.connId"
        :opponent-id="key"
        :transfer="transfer"
      />
    </table>
  </chat-message-wrapper>
</template>
<script lang="ts">
import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {SendingFile} from "@/ts/types/model";
import {bytesToSize} from "@/ts/utils/pureFunctions";
import AppProgressBar from "@/vue/ui/AppProgressBar.vue";
import ChatSendingFileTransfer from "@/vue/chat/message/ChatSendingFileTransfer.vue";
import ChatMessageHeader from "@/vue/chat/message/ChatMessageHeader.vue";
import ChatMessageWrapper from "@/vue/chat/message/ChatMessageWrapper.vue";

@Component({
  name: "ChatSendingFile",
  components: {
    ChatMessageWrapper,
    ChatMessageHeader,
    ChatSendingFileTransfer,
    AppProgressBar,
  },
})
export default class ChatSendingFile extends Vue {
  @Prop() public sendingFile!: SendingFile;

  @State
  public readonly myId!: number;

  public get size() {
    return bytesToSize(this.sendingFile.fileSize);
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"

.message-self
  display: flex

table
  width: 100%

  :deep(th), :deep(td)
    text-align: left

  :deep(th)
    color: #79aeb6
    font-weight: bold
    padding-left: 5px

  :deep(td)
    padding-left: 10px
    width: 100%
    text-overflow: ellipsis
    max-width: 250px
    overflow: hidden
</style>
