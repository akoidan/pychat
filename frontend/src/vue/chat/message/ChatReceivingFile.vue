<template>
  <chat-message-wrapper :class="mainClass" :time="receivingFile.time">
    <template #header>
      <chat-message-header
        :user-id="receivingFile.userId"
      />
    </template>
    <div>
      <receiving-file-info
        :receiving-file="receivingFile"
      />
      <app-progress-bar
        v-if="showProgress"
        :upload="receivingFile.upload"
        class="progress-wrap-file"
      />
      <div
        v-if="showYesNo"
        class="yesNo"
      >
        <input
          class="green-btn"
          type="button"
          value="Accept"
          @click="accept"
        />
        <input
          class="red-btn"
          type="button"
          value="Decline"
          @click="decline"
        />
      </div>
    </div>
  </chat-message-wrapper>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";
import {
  FileTransferStatus,
  ReceivingFile,
} from "@/ts/types/model";
import AppProgressBar from "@/vue/ui/AppProgressBar.vue";
import ChatMessageHeader from "@/vue/chat/message/ChatMessageHeader.vue";
import ReceivingFileInfo from "@/vue/chat/message/ReceivingFileInfo.vue";
import ChatMessageWrapper from "@/vue/chat/message/ChatMessageWrapper.vue";


@Component({
  name: "ChatReceivingFile",
  components: {
    ChatMessageWrapper,
    ReceivingFileInfo,
    ChatMessageHeader,
    AppProgressBar,
  },
})
export default class ChatReceivingFile extends Vue {
  @Prop() public receivingFile!: ReceivingFile;

  @State
  public readonly myId!: number;

  get showYesNo(): boolean {
    return this.receivingFile.status === FileTransferStatus.NOT_DECIDED_YET;
  }


  get showProgress(): boolean {
    return FileTransferStatus.IN_PROGRESS === this.receivingFile.status;
  }

  get mainClass(): string {
    if (this.receivingFile.userId === this.myId) {
      return "message-self message-receiving-file";
    }
    return "message-others message-receiving-file";
  }

  public accept() {
    this.$webrtcApi.acceptFile(this.receivingFile.connId, this.receivingFile.opponentWsId);
  }

  public decline() {
    this.$webrtcApi.declineFile(this.receivingFile.connId, this.receivingFile.opponentWsId);
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"

.message-receiving-file
  display: flex

.progress-wrap-file :deep(.progress-wrap)
  width: calc(100% - 40px)

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
