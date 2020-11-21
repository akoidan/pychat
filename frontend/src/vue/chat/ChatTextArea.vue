<template>
  <div class="userMessageWrapper">
    <input
      v-show="false"
      ref="imgInput"
      type="file"
      accept="image/*,video/*"
      multiple="multiple"
      @change="handleFileSelect"
    >
    <i
      class="icon-picture"
      title="Share Video/Image"
      @click="addImage"
    />
    <i
      class="icon-smile"
      title="Add a smile :)"
      @click="showSmileysChange"
    />
    <media-recorder
      @record="handleRecord"
      @video="handleAddVideo"
      @audio="handleAddAudio"
    />
    <div
      ref="userMessage"
      contenteditable="true"
      class="usermsg input"
      @keydown="checkAndSendMessage"
      @paste="onImagePaste"
    />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Ref,
  Vue,
  Watch
} from 'vue-property-decorator';
import {
  encodeHTML,
  encodeP,
  getMessageData,
  getSmileyHtml,
  pasteBlobAudioToTextArea,
  pasteBlobToContentEditable,
  pasteBlobVideoToTextArea,
  pasteHtmlAtCaret,
  pasteImgToTextArea,
  placeCaretAtEnd,
  savedFiles,
  timeToString
} from '@/ts/utils/htmlApi';
import {
  CurrentUserInfoModel,
  EditingMessage,
  FileModel,
  MessageModel,
  RoomModel,
  UserDictModel
} from '@/ts/types/model';
import { State } from '@/ts/instances/storeInstance';

import {
  MessageDataEncode,
  MessageSender,
  UploadFile
} from '@/ts/types/types';
import {
  sem
} from '@/ts/utils/pureFunctions';
import MediaRecorder from '@/vue/chat/MediaRecorder.vue';
import {
  RawLocation,
  Route
} from "vue-router";


const timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

  @Component({components: {MediaRecorder}})
  export default class ChatTextArea extends Vue {

    @State
    public readonly userInfo!: CurrentUserInfoModel;

    @State
    public readonly showSmileys!: boolean;

    @State
    public readonly editingMessageModel!: MessageModel;

    @State
    public readonly editedMessage!: EditingMessage;

    @Ref()
    public userMessage!: HTMLElement;

    @Ref()
    public imgInput!: HTMLInputElement;

    @State
    public readonly allUsersDict!: UserDictModel;

    @State
    public readonly activeRoomId!: number;

    @State
    public readonly pastingImagesQueue!: string[];

    @State
    public readonly activeRoom!: RoomModel;


    public created() {
      this.$messageBus.$on('drop-photo', this.onEmitDropPhoto);
      this.$messageBus.$on('add-smile', this.onEmitAddSmile);
      this.$messageBus.$on('delete-message', this.onEmitDeleteMessage);
      this.$messageBus.$on('quote', this.onEmitQuote);
    }

    public destroyed() {
      this.$messageBus.$off('drop-photo', this.onEmitDropPhoto);
      this.$messageBus.$off('add-smile', this.onEmitAddSmile);
      this.$messageBus.$off('delete-message', this.onEmitDeleteMessage);
      this.$messageBus.$off('quote', this.onEmitQuote);
    }


    onEmitDropPhoto(files: FileList) {
      for (let i = 0; i < files.length; i++) {
        this.$logger.debug('loop')();
        const file = files[i];
        if (file.type.indexOf('image') >= 0) {
          pasteImgToTextArea(file, this.userMessage, (err: string) => {
            this.$store.growlError(err);
          });
        } else {
          this.$webrtcApi.offerFile(file, this.activeRoomId);
        }
      }
    }

    onEmitAddSmile(code:string) {
      this.$logger.log('Adding smiley {}', code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.userMessage);
    }

    onEmitDeleteMessage() {
      this.editMessageWs(null, this.editedMessage.messageId, this.editedMessage.roomId, null, null, Date.now(), this.editingMessageModel.edited ? this.editingMessageModel.edited + 1 : 1);
      this.$store.setEditedMessage(null);
    }

    onEmitQuote(message: MessageModel) {
      this.userMessage.focus();
      let oldValue = this.userMessage.innerHTML;
      const match = oldValue.match(timePattern);
      const user = this.allUsersDict[message.userId];
      oldValue = match ? oldValue.substr(match[0].length + 1) : oldValue;
      this.userMessage.innerHTML = encodeHTML(`(${timeToString(message.time)}) ${user.user}: `) + encodeP(message) + encodeHTML(' >>>') + String.fromCharCode(13) + ' ' + oldValue;
      placeCaretAtEnd(this.userMessage);
    }


    @Watch('pastingImagesQueue')
    onBlob()  {
      if (this.pastingImagesQueue.length > 0) {
        this.$logger.log('Pasting blob {}', this.pastingImagesQueue)();
        this.pastingImagesQueue.forEach(id => {
          pasteBlobToContentEditable(savedFiles[id], this.userMessage);
          delete savedFiles[id]
        })
        placeCaretAtEnd(this.userMessage);
        this.$store.setPastingQueue([]);
      }
    }

    get messageSender(): MessageSender { // todo does vuew cache this?
      return this.$messageSenderProxy.getMessageSender(this.activeRoomId);
    }

    public checkAndSendMessage(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        event.preventDefault();
        this.$logger.debug('Checking sending message')();
        if (this.editedMessage && this.editedMessage.isEditingNow) {
          const md: MessageDataEncode = getMessageData(this.userMessage, this.editingMessageModel);
          this.editMessageWs(
            md.messageContent,
            this.editedMessage.messageId,
            this.activeRoomId,
            md.currSymbol,
            md.files,
            this.editingMessageModel.time,
            this.editingMessageModel.edited ? this.editingMessageModel.edited + 1 : 1
          );
          this.$store.setEditedMessage(null);
        } else {
          const md: MessageDataEncode = getMessageData(this.userMessage, undefined);
          if (!md.messageContent) { // && !md.files.length // but file content is emppty is symbols are not present
            return;
          }
          this.editMessageWs(
            md.messageContent,
            this.$messageSenderProxy.getUniqueNegativeMessageId(),
            this.activeRoomId,
            md.currSymbol,
            md.files,
            Date.now() - this.$ws.timeDiff,
            0
          );
        }
      } else if (event.keyCode === 27) { // 27 = escape
        this.$store.setShowSmileys(false);
        if (this.editedMessage) {
          this.userMessage.innerHTML = '';
          this.$store.setEditedMessage(null);

        }
      } else if (event.keyCode === 38 && this.userMessage.innerHTML == '') { // up arrow
        const messages = this.activeRoom.messages;
        if (Object.keys(messages).length > 0) {
          let maxTime: MessageModel |null = null;
          for (const m in messages) {
            if (!maxTime || (messages[m].time >= maxTime.time)) {
              maxTime = messages[m];
            }
          }
          sem(event, maxTime!, true, this.userInfo, this.$store.setEditedMessage);
        }
      }
    }

    private editMessageWs(
        messageContent: string|null,
        messageId: number,
        roomId: number,
        symbol: string|null,
        files: {[id: number]: FileModel}|null,
        time: number,
        edited: number
    ): void {
      const mm: MessageModel = {
        roomId,
        deleted: !messageContent,
        id: messageId,
        isHighlighted: false,
        transfer: !!messageContent || messageId > 0 ? { // TODO can this be simplified?
          error: null,
          upload: null
        } : null,
        time,
        sending: true,
        content: messageContent,
        symbol: symbol,
        giphy: null,
        edited,
        files,
        userId: this.userInfo.userId
      };
      this.$store.addMessage(mm);
      this.messageSender.syncMessage(roomId, messageId);
    }

    @Watch('editedMessage')
    public onActiveRoomIdChange(val: EditingMessage) {
      this.$logger.log('editedMessage changed')();
      if (val && val.isEditingNow) {
        this.userMessage.innerHTML = encodeP(this.editingMessageModel);
        placeCaretAtEnd(this.userMessage);
      }
    }


    public handleRecord({src, isVideo}: {src: string; isVideo: boolean}) {
      this.$emit("update:recordingNow", true);
      if (isVideo) {
        this.$emit("update:srcVideo", src);
      }
    }

    public async addImage() {
      if (window.showOpenFilePicker) {
        let filesHandles: FileSystemFileHandle[] = await window.showOpenFilePicker({
          multiple: true,
          types: [
            {
              description: 'Images',
              accept: {
                'image/*': ['.png', '.gif', '.jpeg', '.jpg']
              }
            }
          ]
        })
        let files = await Promise.all(filesHandles.map(a => a.getFile()))
        this.pasteFilesToTextArea(files);
      } else {
        this.imgInput.click();
      }
    }

    public  handleFileSelect (evt: Event) {
      const files: FileList = (evt.target as HTMLInputElement).files!;
      this.pasteFilesToTextArea(files);
      this.imgInput.value = '';
    }


    private pasteFilesToTextArea(files: FileList| File[]) {
      for (let i = 0; i < files.length; i++) {
        pasteImgToTextArea(files[i], this.userMessage, (err: string) => {
          this.$store.growlError(err);
        });
      }
    }

    public onImagePaste(evt: ClipboardEvent) {
      if (evt.clipboardData && evt.clipboardData.files && evt.clipboardData.files.length) {
        this.$logger.debug('Clipboard has {} files', evt.clipboardData!.files.length)();
        for (let i = 0; i < evt.clipboardData!.files.length; i++) {
          const file = evt.clipboardData!.files[i];
          this.$logger.debug('loop {}', file)();
          if (file.type.indexOf('image') >= 0) {
            pasteImgToTextArea(file, this.userMessage, (err: string) => {
              this.$store.growlError(err);
            });
          }
        }
      }
    }

    public handleAddAudio(file: Blob) {
      this.$emit("update:recordingNow", false);
      if (file) {
        pasteBlobAudioToTextArea(file, this.userMessage);
      }
    }

    showSmileysChange() {
      this.$store.setShowSmileys(!this.showSmileys)
    }

    public handleAddVideo(file: Blob) {
      this.$emit("update:srcVideo", null);
      this.$emit("update:recordingNow", false);
      this.$emit('pause-video');
      if (file) {
        pasteBlobVideoToTextArea(file, this.userMessage, 'm', (e: string) => {
          this.$store.growlError(e);
        });
      }
    }

  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>


  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"



  .userMessageWrapper
    padding: 8px
    position: relative
    width: calc(100% - 16px)

    .icon-smile
      @extend %chat-icon
      right: 10px
    .icon-picture
      @extend %chat-icon
      left: 15px

  .color-white .userMessageWrapper /deep/
    .usermsg
      background-color: white
    .icon-picture, .icon-smile, .icon-webrtc-video
      color: #7b7979


  .usermsg /deep/ img[code]
    @extend %img-code


  .usermsg
    margin-left: 4px
    padding-left: 25px
    color: #c1c1c1
    padding-right: 20px // before smiley
    max-height: 200px

    /*fallback
    max-height: 30vh
    min-height: 1.15em

    /*Firefox
    overflow-y: auto
    white-space: pre-wrap

    /deep/ .B4j2ContentEditableImg
      max-height: 200px
      max-width: 400px
      &.failed
        min-width: 200px
        min-height: 100px
    /deep/ .audio-record
      height: 50px

    /deep/ *
      background-color: transparent !important
      color: inherit !important
      font-size: inherit !important
      font-family: inherit !important
      cursor: inherit !important
      font-weight: inherit !important
      margin: 0 !important
      padding: 0 !important
</style>
