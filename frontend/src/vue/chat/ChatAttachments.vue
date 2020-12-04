<template>
  <div v-show="showAttachments" class="attachments-div">
    <input
      v-show="false"
      ref="imgInput"
      type="file"
      accept="image/*,video/*"
      multiple="multiple"
      @change="uploadImage"
    >
    <input
      v-show="false"
      ref="inputFileSend"
      type="file"
      @change="sendFile"
    >
    <input
      v-show="false"
      multiple="multiple"
      ref="inputFileUpload"
      type="file"
      @change="uploadFile"
    >
    <router-link
      to="/painter"
      @click.native="$store.setShowAttachments(false)"
      class="icon-brush"
      title="Draw an Image"
    >
    </router-link>
    <i
      title="Send file directly (p2p)"
      class="icon-doc-inv"
      @click="sendFileClick"
    >
    </i>
    <i
      class="icon-upload-cloud"
      title="Upload file to server"
      @click="uploadFileClick"
    >
    </i>

    <i
      class="icon-picture"
      title="Share Video/Image"
      @click="addImage"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Watch,
  Ref
} from "vue-property-decorator";
import { State } from '@/ts/instances/storeInstance';
import { RoomModel } from '@/ts/types/model';

@Component
export default class ChatAttachments extends Vue {

  @Ref()
  public imgInput!: HTMLInputElement;

  @Ref()
  public inputFileSend!: HTMLInputElement;

  @Ref()
  public inputFileUpload!: HTMLInputElement;

  @State
  public readonly activeRoomId!: number;

  @State
  public readonly showAttachments!: boolean;

  public async addImage() {
    this.$store.setShowAttachments(false);
    // TODO seems like filePicker has limited about of time which file lives.
    //  Sometimes it errors `net::ERR_FILE_NOT_FOUND` on upload
    // if (window.showOpenFilePicker) {
    //   let filesHandles: FileSystemFileHandle[] = await window.showOpenFilePicker({
    //     multiple: true,
    //     types: [
    //       {
    //         description: 'Images',
    //         accept: {
    //           'image/*': ['.png', '.gif', '.jpeg', '.jpg']
    //         }
    //       }
    //     ]
    //   })
    //   let files = await Promise.all(filesHandles.map(a => a.getFile()))
    //
    //   this.pasteFilesToTextArea(files);
    // } else {
    this.imgInput.click();
    // }
  }

  public uploadFileClick() {
    this.inputFileUpload.value = '';
    this.$store.setShowAttachments(false);
    this.inputFileUpload.click();
  }

  public sendFileClick() {
    this.inputFileSend.value = '';
    this.$store.setShowAttachments(false);
    this.inputFileSend.click();
  }

  public uploadImage(evt: Event) {
    this.$logger.log("Got images to send: {}",  (evt.target as HTMLInputElement).files)();
    const files: FileList = (evt.target as HTMLInputElement).files!;
    this.$messageBus.$emit('paste-images', files);
    this.imgInput.value = '';
  }

  public uploadFile() {
    this.$logger.log("Got files to send: {}", this.inputFileUpload.files)();
    const files: FileList = this.inputFileUpload.files!;
    this.$messageBus.$emit('paste-files', files);
  }

  public sendFile() {
    this.$logger.log("Got files to send: {}", this.inputFileSend.files)();
    if (this.inputFileSend.files) {
      for (let i = 0; i < this.inputFileSend.files!.length; i++) {
        this.$webrtcApi.sendFileOffer(this.inputFileSend.files![i], this.activeRoomId);
      }
    }
  }

}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .attachments-div
    position: absolute
    left: 0
    padding: 10px 10px 3px 5px
    bottom: 0
    font-size: 40px
    border-radius: 10px
    [class^="icon-"]
      padding: 5px
      cursor: pointer

  .color-lor
    .icon-doc-inv
      color: #b8b800
    .attachments-div
      @extend %window-lor
    .icon-brush
      color: #960000
    .icon-upload-cloud
      color: #40b2b2
    .icon-picture
      color: green


  .color-reg
    .icon-doc-inv
      @include hover-click(#b8b800)
    .icon-upload-cloud
      @include hover-click(#15dfff)
    .attachments-div
      @extend %window-reg
    .icon-brush
      @include hover-click(#ee0000)
    .icon-picture
      @include hover-click(#37ce00)


  .color-white
    .icon-upload-cloud
      color: #0095ad
    .icon-brush
      color: #c51900
    .attachments-div
      @extend %window-white


</style>