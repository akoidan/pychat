<template>
  <tbody>
    <tr>
      <th>To {{user}}</th>
      <td v-if="showBar"> <app-progress-bar @retry="retry" :upload="transfer"/></td>
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
  import {ReceivingFileStatus, SendingFileTransfer, UserModel} from "../../types/model";

  const fileStatusDict: {} = {};
 fileStatusDict[ReceivingFileStatus.NOT_DECIDED_YET] = 'Waiting to accept';
 fileStatusDict[ReceivingFileStatus.IN_PROGRESS] = 'Sending...';
 fileStatusDict[ReceivingFileStatus.FINISHED] = 'Successfully sent';
 fileStatusDict[ReceivingFileStatus.DECLINED] = 'Declined by user';
 fileStatusDict[ReceivingFileStatus.ERROR] = 'Error';

  @Component({
    components: {AppProgressBar}
  })
  export default class ChatSendingFileTransfer extends Vue {

    @Prop() transfer: SendingFileTransfer;
    @State allUsersDict: {[id: number]: UserModel};

    get showBar(): boolean {
      return this.transfer.status === ReceivingFileStatus.IN_PROGRESS;
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
</style>