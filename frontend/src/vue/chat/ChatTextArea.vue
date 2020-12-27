<template>
  <div class="userMessageWrapper">
    <chat-attachments
      v-if="showAttachments"
      :room-id="roomId"
      :edit-message-id="editMessageId"
      :thread-message-id="threadMessageId"
      @close="showAttachments = false"
      @upload-file="pasteFilesToTextArea"
      @upload-image="pasteImagesToTextArea"
      @add-audio="addAudio"
      @add-video="addVideo"
    />
    <smiley-holder v-if="showSmileys" @close="showSmileys = false" @add-smiley="onEmitAddSmile"/>
    <media-recorder
      ref="mediaRecorder"
      :is-video="isRecordingVideo"
      @video="handleAddVideo"
      @audio="handleAddAudio"
    />
    <div>
      <i
        v-if="isMobile"
        class="icon-paper-plane"
        title="Send this message"
        @click="sendMessage"
      />
      <i
        class="icon-attach-outline"
        title="Add attachment"
        @click="showAttachments = !showAttachments"
      />
      <i
        class="icon-smile"
        title="Add a smile :)"
        @click="showSmileys = !showSmileys"
      />
      <div
        ref="userMessage"
        contenteditable="true"
        class="usermsg input"
        :class="{'mobile-user-message': isMobile}"
        @keydown="onTextAreaKeyDown"
        @paste="onImagePaste"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Ref,
  Vue,
  Watch,
  Prop,
} from 'vue-property-decorator';
import {
  encodeHTML,
  encodeP,
  getMessageData,
  getSmileyHtml,
  pasteBlobAudioToTextArea,
  pasteBlobToContentEditable,
  pasteBlobVideoToTextArea,
  pasteFileToTextArea,
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
  MessageModel, PastingTextAreaElement,
  RoomDictModel,
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
  editMessageWs
} from '@/ts/utils/pureFunctions';
import MediaRecorder from '@/vue/chat/MediaRecorder.vue';
import {
  RawLocation,
  Route
} from "vue-router";
import ChatAttachments from '@/vue/chat/ChatAttachments.vue';
import SmileyHolder from '@/vue/chat/SmileyHolder.vue';
import {isMobile} from '@/ts/utils/runtimeConsts';

const timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

  @Component({components: {SmileyHolder, ChatAttachments, MediaRecorder}})
  export default class ChatTextArea extends Vue {

    @State
    public readonly userInfo!: CurrentUserInfoModel;

    @Prop({default: null})
    public readonly editMessageId!: number;

    @Prop({default: null})
    public readonly threadMessageId!: number;

    @Prop()
    public readonly roomId!: number;

    @Ref()
    public userMessage!: HTMLElement;

    @Ref()
    public mediaRecorder!: MediaRecorder;

    @State
    public readonly allUsersDict!: UserDictModel;

    @State
    public readonly roomsDict!: RoomDictModel;

    @State
    public readonly pastingTextAreaQueue!: PastingTextAreaElement[];

    @State
    public readonly activeRoom!: RoomModel;

    private showAttachments: boolean = false;
    private showSmileys: boolean = false;
    private isRecordingVideo: boolean = true;

    get room() {
      return this.roomsDict[this.roomId];
    }

    get isMobile() {
      return isMobile;
    }

    get editMessage(): MessageModel|null {
      if (this.editMessageId) {
        return this.room.messages[this.editMessageId]
      } else {
        return null
      }
    }

    get threadMesage(): MessageModel|null {
      if (this.threadMessageId) {
        return this.room.messages[this.threadMessageId]
      } else {
        return null
      }
    }

    public mounted() {
      if (this.editMessage) {
        this.userMessage.innerHTML = encodeP(this.editMessage)
        placeCaretAtEnd(this.userMessage);;
      }
    }

    public onEmitDropPhoto(files: FileList) {
      for (let i = 0; i < files.length; i++) {
        this.$logger.debug('loop')();
        const file = files[i];
        if (file.type.indexOf('image') >= 0) {
          pasteImgToTextArea(file, this.userMessage, (err: string) => {
            this.$store.growlError(err);
          });
        } else {
          this.$webrtcApi.sendFileOffer(file, this.roomId, this.threadMessageId);
        }
      }
    }

    onEmitAddSmile(code:string) {
      this.$logger.log('Adding smiley {}', code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.userMessage);
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


    @Watch('pastingTextAreaQueue')
    onBlob()  {
      if (this.pastingTextAreaQueue.length > 0) {
        this.$logger.log('Pasting blob {}', this.pastingTextAreaQueue)();
        this.pastingTextAreaQueue.forEach(id => {
          if (id.elType === 'blob' && id.openedThreadId == this.threadMessageId && id.roomId == this.roomId && id.editedMessageId === this.editMessageId) {
            pasteBlobToContentEditable(savedFiles[id.content], this.userMessage);
            delete savedFiles[id.content]
            this.$store.setPastingQueue(this.pastingTextAreaQueue.filter(el => el != id));
          }
        })
        placeCaretAtEnd(this.userMessage);
      }
    }

    get messageSender(): MessageSender { // todo does vuew cache this?
      return this.$messageSenderProxy.getMessageSender(this.roomId);
    }

    public onTextAreaKeyDown(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        if (isMobile) {
          // do not block multiple lines on mobile, let user use button to send
          return;
        }
        event.preventDefault();
        this.sendMessage();
      } else if (event.keyCode === 27) { // 27 = escape
        this.cancelCurrentAction();
      } else if (event.keyCode === 38 && this.userMessage.innerHTML == '') { // up arrow
        this.setEditedMessage(event);
      }
    }


    private setEditedMessage(event: KeyboardEvent) {
      const messages = this.activeRoom.messages;

      if (Object.keys(messages).length > 0) {
        let maxTime: MessageModel | null = null;
        for (const m in messages) {
          if (!maxTime || (messages[m].time >= maxTime.time)) {
            maxTime = messages[m];
          }
        }
        event.preventDefault();
        event.stopPropagation(); // otherwise up event would be propaganded to chatbox which would lead to load history

        if (event.target
            && (<HTMLElement>event.target).tagName !== 'IMG'
            && maxTime!.userId === this.userInfo.userId
            && !maxTime!.deleted
        ) {
          const newlet: EditingMessage = {
            messageId: maxTime!.id,
            isEditingNow: true,
            roomId: maxTime!.roomId
          };
          this.$store.setEditedMessage(newlet);
        }
      }
    }

    private cancelCurrentAction() {
      if (this.editMessageId) {
        this.userMessage.innerHTML = '';
        this.$store.setEditedMessage({
          messageId: this.editMessageId,
          isEditingNow: false,
          roomId: this.roomId
        });
      } else if (this.threadMessageId) {
        this.$store.setCurrentThread({
          roomId: this.roomId,
          isEditingNow: false,
          messageId: this.threadMessageId
        });
      } else if (this.showSmileys) { // do not cancel all at once, cancel one by one
        this.showSmileys = false;
      }
    }

    private sendMessage() {
      this.$logger.debug('Checking sending message')();
      if (this.editMessage) {
        const md: MessageDataEncode = getMessageData(this.userMessage, this.editMessage!);
        editMessageWs(
            md.messageContent,
            this.editMessage.id,
            this.roomId,
            md.currSymbol,
            md.files,
            this.editMessage.time,
            this.editMessage.edited ? this.editMessage.edited + 1 : 1,
            this.editMessage.parentMessage,
            this.$store,
            this.messageSender
        );
        this.$store.setEditedMessage({
          roomId: this.roomId,
          isEditingNow: false,
          messageId: this.editMessage.id
        });
      } else {
        const md: MessageDataEncode = getMessageData(this.userMessage, undefined);
        if (!md.messageContent) { // && !md.files.length // but file content is emppty is symbols are not present
          return;
        }
        editMessageWs(
            md.messageContent,
            this.$messageSenderProxy.getUniqueNegativeMessageId(),
            this.roomId,
            md.currSymbol,
            md.files,
            Date.now(),
            0,
            this.threadMessageId ?? null,
            this.$store,
            this.messageSender
        );
      }
    }

    private pasteImagesToTextArea(files: FileList| File[]) {
      console.error(files);
      this.showAttachments = false;
      for (let i = 0; i < files.length; i++) {
        pasteImgToTextArea(files[i], this.userMessage, (err: string) => {
          this.$store.growlError(err);
        });
      }
    }

    private addVideo() {
      this.isRecordingVideo = true;
      this.mediaRecorder.startRecord();
    }

    private addAudio() {
      this.isRecordingVideo = false;
      this.mediaRecorder.startRecord();
    }

    private pasteFilesToTextArea(files: FileList| File[]) {
      this.showAttachments = false;
      for (let i = 0; i < files.length; i++) {
        pasteFileToTextArea(files[i], this.userMessage, (err: string) => {
          this.$store.growlError(err);
        });
      }
    }

    public onImagePaste(evt: ClipboardEvent) {
      let preventDefault = false;
      if (evt.clipboardData?.files?.length) {
        this.$logger.debug('Clipboard has {} files', evt.clipboardData!.files.length)();
        for (let i = 0; i < evt.clipboardData!.files.length; i++) {
          const file = evt.clipboardData!.files[i];
          this.$logger.debug('loop {}', file)();
          if (file.type.indexOf('image') >= 0) {
            preventDefault = true;
            pasteImgToTextArea(file, this.userMessage, (err: string) => {
              this.$store.growlError(err);
            });
          }
        }
      }
      if (preventDefault) {
        evt.preventDefault();
      }
    }

    public handleAddAudio(file: Blob) {
      if (file) {
        pasteBlobAudioToTextArea(file, this.userMessage);
      }
    }

    public handleAddVideo(file: Blob) {
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

    .icon-attach-outline
      @extend %chat-icon
      left: 15px
    .icon-paper-plane
      @extend %chat-icon
      right: 40px
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


  .usermsg /deep/ img[alt] //smile
    @extend %img-code

  .usermsg.mobile-user-message
    padding-right: 50px // before smiley and send
  .usermsg
    z-index: 2
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
    /deep/ .uploading-file
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
