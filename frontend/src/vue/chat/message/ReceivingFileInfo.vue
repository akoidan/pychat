<template>
  <table>
    <tbody>
      <tr>
        <th>Name:</th>
        <td>{{ receivingFile.fileName }}</td>
      </tr>
      <tr>
        <th>Size:</th>
        <td>{{ size }}</td>
      </tr>
      <tr>
        <th>Status:</th>
        <td :class="cls">
          {{ status }}
        </td>
      </tr>
      <tr v-if="receivingFile.anchor">
        <th>Download:</th>
        <td>
          <a
            :download="receivingFile.fileName"
            :href="receivingFile.anchor"
            class="green-btn"
          >Save</a>
        </td>
      </tr>

      <tr v-if="isError">
        <th>
          Retry
        </th>
        <td>
          <i
            class="icon-repeat"
            @click="retry"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {bytesToSize} from "@/ts/utils/pureFunctions";
import {
  FileTransferStatus,
  ReceivingFile,
} from "@/ts/types/model";

@Component({name: "ReceivingFileInfo"})
export default class ReceivingFileInfo extends Vue {
  @Prop() public receivingFile!: ReceivingFile;

  public get size(): string {
    return bytesToSize(this.receivingFile.upload.total);
  }

  public get isError(): boolean {
    return this.receivingFile.status === FileTransferStatus.ERROR;
  }

  public get cls() {
    return {
      success: FileTransferStatus.FINISHED === this.receivingFile.status,
      error: FileTransferStatus.ERROR === this.receivingFile.status,
    };
  }

  public get status(): string {
    switch (this.receivingFile.status) {
      case FileTransferStatus.ERROR:
        return this.receivingFile.error!;
      case FileTransferStatus.IN_PROGRESS:
        return "Downloading...";
      case FileTransferStatus.DECLINED_BY_OPPONENT:
        return "Declined by opponent";
      case FileTransferStatus.DECLINED_BY_YOU:
        return "Declined by you";
      case FileTransferStatus.FINISHED:
        return "Finished";
      case FileTransferStatus.NOT_DECIDED_YET:
        return "Waiting for approval";
    }
  }

  public retry() {
    this.$webrtcApi.retryFile(this.receivingFile.connId, this.receivingFile.opponentWsId);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

.error
  color: red

.success
  color: #3eb22b

table
  width: 100%
  text-align: left

  th
    color: #79aeb6
    font-weight: bold
    padding-left: 5px

  td
    text-overflow: ellipsis
    max-width: 250px
    overflow: hidden
    width: 100%
    padding-left: 10px

a
  width: calc(100% - 50px)
  display: block
  text-align: center
  margin-left: 10px
  margin-right: 10px

.icon-repeat
  cursor: pointer
</style>
