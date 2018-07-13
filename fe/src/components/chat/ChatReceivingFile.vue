<template>
  <div>
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
        <th>From</th>
        <td>{{user}}</td>
      </tr>
      <tr>
        <td colspan="2">
          <app-progress-bar v-if="!transfer.finished" @retry="retry" :upload="transfer"/>
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
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {ReceivingFile, SendingFile, UserModel} from "../../types/model";
  import {bytesToSize} from '../../utils/utils';
  import AppProgressBar from '../ui/AppProgressBar';
  @Component({
    components: {AppProgressBar}
  })
  export default class ChatSendingFile extends Vue {
    @Prop() receivingFile: ReceivingFile;
    @State allUsersDict: {[id: number]: UserModel};

    get size() {
      return bytesToSize(this.receivingFile.total)
    }

    user() {
      this.allUsersDict[this.receivingFile.userId].user;
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