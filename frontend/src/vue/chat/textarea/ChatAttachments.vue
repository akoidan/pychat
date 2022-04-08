<template>
  <div class="attachments-div" @mousedown.prevent>
    <!--   @mousedown.prevent prevent looseing focus from contenteditable-->
    <input
      v-show="false"
      ref="imgInput"
      accept="image/*,video/*"
      multiple
      type="file"
      @change="uploadImage"
    />
    <input
      v-show="false"
      ref="inputFileSend"
      type="file"
      @change="sendFile"
    />
    <input
      v-show="false"
      ref="inputFileUpload"
      multiple
      type="file"
      @change="uploadFile"
    />
    <router-link
      :to="paintUrl"
      class="icon-brush"
      title="Draw an Image"
      @click.native="close"
    />
    <i
      class="icon-doc-inv"
      title="Send file directly (p2p)"
      @click="sendFileClick"
    />
    <i
      class="icon-smile"
      title="Send a random gif animation from text"
      @click="addGiphy"
    />
    <i
      class="icon-upload-cloud"
      title="Upload file to server"
      @click="uploadFileClick"
    />

    <i
      class="icon-picture"
      title="Share Video/Image"
      @click="addImage"
    />
    <i
      class="icon-webrtc-video"
      title="Record and send a video message"
      @click="addVideo"
    />
    <i
      class="icon-mic-1"
      title="Record and send an audio message"
      @click="addAudio"
    />

    <i
      class="icon-cancel-circled-outline"
      title="Close this window"
      @click="close"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Ref,
  Vue,
} from "vue-property-decorator";
import {buildQueryParams} from "@/ts/utils/pureFunctions";

@Component({name: "ChatAttachments"})
export default class ChatAttachments extends Vue {
  @Ref()
  public imgInput!: HTMLInputElement;

  @Ref()
  public inputFileSend!: HTMLInputElement;

  @Ref()
  public inputFileUpload!: HTMLInputElement;


  @Prop({default: null})
  public readonly editMessageId!: number;

  @Prop({default: null})
  public readonly threadMessageId!: number;

  @Prop()
  public readonly roomId!: number;

  public get paintUrl() {
    const params: Record<string, number | string> = {
      roomId: this.roomId,
    };
    if (this.editMessageId) {
      params.editedMessageId = this.editMessageId;
    }
    if (this.threadMessageId) {
      params.openedThreadId = this.threadMessageId;
    }
    const queryParams = buildQueryParams(params);

    return `/painter?${queryParams}`;
  }

  @Emit()
  close() {
  }

  @Emit()
  public addGiphy() {
    this.close();
  }

  @Emit()
  public addVideo() {
    this.close();
  }

  @Emit()
  public addAudio() {
    this.close();
  }

  public async addImage() {

    /*
     * This.$store.setShowAttachments(false);
     * TODO seems like filePicker has limited about of time which file lives.
     *  Sometimes it errors `net::ERR_FILE_NOT_FOUND` on upload
     * if (window.showOpenFilePicker) {
     *   let filesHandles: FileSystemFileHandle[] = await window.showOpenFilePicker({
     *     multiple: true,
     *     types: [
     *       {
     *         description: 'Images',
     *         accept: {
     *           'image/*': ['.png', '.gif', '.jpeg', '.jpg']
     *         }
     *       }
     *     ]
     *   })
     *   let files = await Promise.all(filesHandles.map(a => a.getFile()))
     * } else {
     */
    this.imgInput.click();
  }

  public uploadFileClick() {
    this.inputFileUpload.value = "";
    // This.$store.setShowAttachments(false);
    this.inputFileUpload.click();
  }

  public sendFileClick() {
    this.inputFileSend.value = "";
    // This.$store.setShowAttachments(false);
    this.inputFileSend.click();
  }

  @Emit()
  public uploadImage(evt: Event) {
    this.$logger.log("Got images to send: {}", (evt.target as HTMLInputElement).files)();
    const files: FileList = (evt.target as HTMLInputElement).files!;

    /*
     * Save files before clearing input.
     * if we avoid array.from, default obect filelist is live, meaning it would have size 0 after clearing
     */
    const result = Array.from(files);
    this.imgInput.value = "";
    return result;
  }

  @Emit()
  public uploadFile() {
    this.$logger.log("Got files to send: {}", this.inputFileUpload.files)();
    const files: FileList = this.inputFileUpload.files!;
    const result = Array.from(files);

    /*
     * Save files before clearing input.
     * if we avoid array.from, default obect filelist is live, meaning it would have size 0 after clearing
     */
    this.inputFileUpload.value = "";
    return result;
  }

  public sendFile() {
    this.$logger.log("Got files to send: {}", this.inputFileSend.files)();
    if (this.inputFileSend.files) {
      for (let i = 0; i < this.inputFileSend.files!.length; i++) {
        this.$webrtcApi.sendFileOffer(this.inputFileSend.files![i], this.roomId, this.threadMessageId);
      }
    }
    this.close();
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

.icon-cancel-circled-outline
  margin-left: auto

.attachments-div
  padding: 10px 10px 3px 5px
  bottom: 2px
  // otherwise there would be scroll
  font-size: 30px
  display: flex
  flex-wrap: wrap
  // dont push width on mobile
  border-radius: 10px
  @extend %modal-window

  [class^="icon-"]
    padding: 5px
    display: inline-block
    cursor: pointer

.color-lor
  .icon-doc-inv
    color: #b8b800

  .icon-brush
    color: #960000

  .icon-upload-cloud
    color: #40b2b2

  .icon-picture
    color: green


.color-reg
  .icon-mic-1
    @include hover-click(#b87300)

  .icon-webrtc-video
    @include hover-click(#c149b7)

  .icon-doc-inv
    @include hover-click(#b8b800)

  .icon-upload-cloud
    @include hover-click(#15dfff)

  .icon-brush
    @include hover-click(#6b75ff)

  .icon-cancel-circled-outline
    @include hover-click(#ee0000)

  .icon-picture
    @include hover-click(#37ce00)

  .icon-smile
    @include hover-click(#ce793e)


.color-white
  .icon-upload-cloud
    color: #0095ad

  .icon-brush
    color: #c51900


</style>
