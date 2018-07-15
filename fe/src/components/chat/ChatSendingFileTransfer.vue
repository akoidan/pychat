<template>
  <tbody>
    <tr>
      <th>To {{user}}</th>
      <td v-if="showBar"> <app-progress-bar @retry="retry" :upload="transfer.upload"/></td>
      <td v-else>
        {{status}}
      </td>
    </tr>
  </tbody>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppProgressBar from '../ui/AppProgressBar';
  import {FileTransferStatus, SendingFileTransfer, UserModel} from "../../types/model";

  const fileStatusDict: {} = {};
 fileStatusDict[FileTransferStatus.NOT_DECIDED_YET] = 'Waiting to accept';
 fileStatusDict[FileTransferStatus.IN_PROGRESS] = 'Sending...';
 fileStatusDict[FileTransferStatus.FINISHED] = 'Successfully sent';
 fileStatusDict[FileTransferStatus.DECLINED] = 'Declined by user';
 fileStatusDict[FileTransferStatus.ERROR] = 'Error';

  @Component({
    components: {AppProgressBar}
  })
  export default class ChatSendingFileTransfer extends Vue {

    @Prop() transfer: SendingFileTransfer;
    @State allUsersDict: {[id: number]: UserModel};

    get showBar(): boolean {
      return this.transfer.status === FileTransferStatus.IN_PROGRESS;
    }

    retry() {
      alert('retry');
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
</style>