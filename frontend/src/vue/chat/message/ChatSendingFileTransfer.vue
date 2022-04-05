<template>
  <tbody>
    <tr>
      <th>To {{ user }}</th>
      <td v-if="showBar">
        <app-progress-bar :upload="transfer.upload"/>
      </td>
      <td
        v-else
        :class="cls"
      >
        {{ status }}<span
          v-if="showCancel"
          class="icon-cancel"
          @click="declineSending"
        />
      </td>
    </tr>
  </tbody>
</template>
<script lang="ts">

import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import AppProgressBar from "@/vue/ui/AppProgressBar.vue";
import type {UserModel} from "@/ts/types/model";
import {
  FileTransferStatus,
  SendingFileTransfer,
} from "@/ts/types/model";


const fileStatusDict: Record<FileTransferStatus, string> = {
  [FileTransferStatus.NOT_DECIDED_YET]: "Waiting to accept",
  [FileTransferStatus.IN_PROGRESS]: "Sending...",
  [FileTransferStatus.FINISHED]: "Successfully sent",
  [FileTransferStatus.DECLINED_BY_OPPONENT]: "Declined by opponent",
  [FileTransferStatus.DECLINED_BY_YOU]: "Declined by you",
  [FileTransferStatus.ERROR]: "Error",
};

@Component({
  name: "ChatSendingFileTransfer",
  components: {AppProgressBar},
})
export default class ChatSendingFileTransfer extends Vue {
  @Prop() public transfer!: SendingFileTransfer;

  @Prop() public connId!: string;

  @Prop() public opponentId!: string;

  @State
  public readonly allUsersDict!: Record<number, UserModel>;

  public get showBar(): boolean {
    return this.transfer.status === FileTransferStatus.IN_PROGRESS;
  }

  public get showCancel(): boolean {
    return this.transfer.status === FileTransferStatus.NOT_DECIDED_YET ||
      this.transfer.status === FileTransferStatus.IN_PROGRESS;
  }

  public get cls() {
    return {
      success: FileTransferStatus.FINISHED === this.transfer.status,
      error: FileTransferStatus.ERROR === this.transfer.status,
    };
  }

  public get user() {
    return this.allUsersDict[this.transfer.userId].user;
  }

  public get status() {
    if (this.transfer.error) {
      return this.transfer.error;
    }

    return fileStatusDict[this.transfer.status];
  }

  public declineSending() {
    this.$webrtcApi.declineSending(this.connId, this.opponentId);
  }
}
</script>

<style lang="sass" scoped>
tr :deep(.progress-wrap)
  width: calc(100% - 40px)

.icon-cancel
  cursor: pointer
  color: red

.error
  color: red

.success
  color: #3eb22b
</style>
