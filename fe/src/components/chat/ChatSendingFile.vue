<template>
  <div>
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
      <template  v-for="(transfer, id) in sendingFile.transfers">
        <tr :key="'h'+id">
          <th>To {{getUser(transfer.userId)}}</th>
          <td v-if="!transfer.accepted">Waiting to accept..</td>
          <td v-else-if="!transfer.finished">Transferring...</td>
          <td v-else>Transferred</td>
        </tr>
        <tr :key="'v'+id">
          <td colspan="2">
            <app-progress-bar v-if="!transfer.finished" @retry="retry" :upload="transfer"/>
          </td>
        </tr>
      </template>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {SendingFile, UserModel} from "../../types/model";
  import {bytesToSize} from '../../utils/utils';
  import AppProgressBar from '../ui/AppProgressBar';
  @Component({
    components: {AppProgressBar}
  })
  export default class ChatSendingFile extends Vue {
    @Prop() sendingFile: SendingFile;
    @State allUsersDict: {[id: number]: UserModel};

    get size() {
      return bytesToSize(this.sendingFile.fileSize)
    }

    getUser(userId: number) {
      this.allUsersDict[userId].user;
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
</style>