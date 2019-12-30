<template>
  <tbody>
    <tr>
      <th>To {{ user }}</th>
      <td v-if="showBar">
        <app-progress-bar :upload="transfer.upload" />
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

import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue} from 'vue-property-decorator';
import AppProgressBar from '@/components/ui/AppProgressBar.vue';
import {FileTransferStatus, SendingFileTransfer, UserModel} from '@/types/model';
import {webrtcApi} from '@/utils/singletons';

const fileStatusDict: { [id: number]: string } = {};
fileStatusDict[FileTransferStatus.NOT_DECIDED_YET] = 'Waiting to accept';
fileStatusDict[FileTransferStatus.IN_PROGRESS] = 'Sending...';
fileStatusDict[FileTransferStatus.FINISHED] = 'Successfully sent';
fileStatusDict[FileTransferStatus.DECLINED_BY_OPPONENT] = 'Declined by opponent';
fileStatusDict[FileTransferStatus.DECLINED_BY_YOU] = 'Declined by you';
fileStatusDict[FileTransferStatus.ERROR] = 'Error';

@Component({
  components: {AppProgressBar}
})
export default class ChatSendingFileTransfer extends Vue {

  @Prop() public transfer!: SendingFileTransfer;
  @Prop() public connId!: string;
  @Prop() public opponentId!: string;
  @State
  public readonly allUsersDict!: {[id: number]: UserModel} ;

  get showBar(): boolean {
    return this.transfer.status === FileTransferStatus.IN_PROGRESS;
  }

  get showCancel(): boolean {
    return this.transfer.status === FileTransferStatus.NOT_DECIDED_YET
        || this.transfer.status === FileTransferStatus.IN_PROGRESS;
  }

  public declineSending() {
    webrtcApi.declineSending(this.connId, this.opponentId);
  }

  get cls() {
    return {
      success: FileTransferStatus.FINISHED === this.transfer.status,
      error: FileTransferStatus.ERROR === this.transfer.status
    };
  }

  get user () {
    return this.allUsersDict[this.transfer.userId].user;
  }

  get status () {
    if (this.transfer.error) {
      return this.transfer.error;
    }

    return fileStatusDict[this.transfer.status];
  }
}
</script>

<style lang="sass" scoped>
  tr /deep/ .progress-wrap
    width: calc(100% - 40px)

  .icon-cancel
    cursor: pointer
    color: red
  .error
    color: red
  .success
    color: #3eb22b
</style>
