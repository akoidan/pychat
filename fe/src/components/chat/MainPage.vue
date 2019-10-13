<template>
  <div class="holder">
    <nav-edit-message
        v-if="editedMessage"
        :edited-message="editedMessage"
        @close="closeEditing"
        @delete-message="navDeleteMessage"
        @edit-message="navEditMessage"/>
    <nav-user-show v-if="activeUser" :active-user="activeUser"/>
    <div class="wrapper">
      <div class="chatBoxHolder" @drop.prevent="dropPhoto" v-show="!dim">
        <template v-for="room in roomsArray">
          <chat-box :room="room" :key="room.id" v-show="activeRoomId === room.id"/>
        </template>
        <div v-if="!activeRoom" class="noRoom" >
          <router-link to="/chat/1">This room doesn't exist, or you don't have access to it. Click to go to main room</router-link>
        </div>
      </div>
      <div v-show="dim" class="videoHolder" >
        <div v-show="recordingNow">
          <video v-show="srcVideo" autoplay="" ref="video"></video>
          <img v-show="!srcVideo" src="@/assets/img/audio.svg" class="audio-recording-now">
        </div>
        <span v-show="!recordingNow">Starting recording...</span>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" @add-smiley="addSmiley"/>
    </div>

    <div class="userMessageWrapper" >
      <input type="file" @change="handleFileSelect" accept="image/*,video/*" ref="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" title="Share Video/Image" @click="addImage"></i>
      <i class="icon-smile" title="Add a smile :)" @click="showSmileys = !showSmileys"></i>
      <media-recorder @record="handleRecord" @video="handleAddVideo" @audio="handleAddAudio"/>
      <div contenteditable="true" ref="userMessage" class="usermsg input" @keydown="checkAndSendMessage" @paste="onImagePaste"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue, Watch, Ref} from "vue-property-decorator";

  import {oc} from 'ts-optchain';
  import RoomUsers from "@/components/chat/RoomUsers"
  import ChatBox from "@/components/chat/ChatBox"
  import SmileyHolder from "@/components/chat/SmileyHolder"
  import {
    CurrentUserInfoModel,
    EditingMessage,
    FileModel,
    MessageModel,
    RoomModel,
    UploadProgressModel, UserDictModel, UserModel
  } from "@/types/model";
  import {
    encodeHTML,
    encodeMessage,
    encodeP,
    getMessageData,
    getSmileyHtml, pasteBlobAudioToTextArea, pasteBlobToContentEditable, pasteBlobVideoToTextArea,
    pasteHtmlAtCaret,
    pasteImgToTextArea, placeCaretAtEnd, stopVideo, timeToString
  } from "@/utils/htmlApi";
  import NavEditMessage from "@/components/chat/NavEditMessage";
  import NavUserShow from "@/components/chat/NavUserShow";
  import {sem} from "@/utils/utils";
  import {MessageDataEncode, RemoveSendingMessage, UploadFile} from "@/types/types";
  import {channelsHandler, globalLogger, messageBus, webrtcApi} from "@/utils/singletons";
  import {State} from '@/utils/storeHolder';
  import MediaRecorder from '@/components/chat/MediaRecorder';
  import {Route, RawLocation} from 'vue-router'

  const timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

  @Component({components: {MediaRecorder, RoomUsers, ChatBox, SmileyHolder, NavEditMessage, NavUserShow}})
  export default class ChannelsPage extends Vue {
    @State
    public readonly editedMessage!: EditingMessage;
    @State
    public readonly allUsersDict!: UserDictModel;
    @State
    public readonly userInfo!: CurrentUserInfoModel;
    @State
    public readonly activeRoomId!: number;
    @State
    public readonly dim!: boolean;
    @State
    public readonly roomsArray!: RoomModel[];
    @State
    public readonly activeUser!: UserModel;
    @State
    public readonly activeRoom!: RoomModel;
    @State
    public readonly editingMessageModel!: MessageModel;

    // used in mixin from event.keyCode === 38

    srcVideo: string|null = null;

    @Ref()
    userMessage!: HTMLElement;
    @Ref()
    imgInput!: HTMLInputElement;
    @Ref()
    video!: HTMLVideoElement;

    recordingNow: boolean = false;


    @Watch('editedMessage')
    onActiveRoomIdChange(val: EditingMessage) {
      this.logger.log("editedMessage changed")();
      if (val && val.isEditingNow) {
        this.userMessage.innerHTML = encodeP(this.editingMessageModel);
        placeCaretAtEnd(this.userMessage);
      }
    }

    @Watch('srcVideo')
    onSrcChange(value: MediaStream | MediaSource | Blob | null) {
      if (this.video) {
        this.video.srcObject = value;
      }
    }

    beforeRouteEnter(to: Route, frm: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) {
      next(vm => {
        messageBus.$emit("main-join");
      });
    }

    onImagePaste(evt: ClipboardEvent) {
      if (oc(evt).clipboardData.files.length) {
        this.logger.debug("Clipboard has {} files", evt.clipboardData!.files.length)();
        for (var i = 0; i < evt.clipboardData!.files.length; i++) {
          var file = evt.clipboardData!.files[i];
          this.logger.debug("loop {}", file)();
          if (file.type.indexOf("image") >= 0) {
            pasteImgToTextArea(file, this.userMessage, (err: string) => {
              this.store.growlError(err)
            });
          }
        }
      }
    }

    created() {
      messageBus.$on('quote', (message :MessageModel) => {
        this.userMessage.focus();
        let oldValue = this.userMessage.innerHTML;
        let match = oldValue.match(timePattern);
        let user = this.allUsersDict[message.userId];
        oldValue = match ? oldValue.substr(match[0].length + 1) : oldValue;
        this.userMessage.innerHTML = encodeHTML(`(${timeToString(message.time)}) ${user.user}: `) + encodeP(message) + encodeHTML(' >>>') + String.fromCharCode(13) +' '+ oldValue;
        placeCaretAtEnd(this.userMessage);
      });
      messageBus.$on("blob", (e: Blob) => {
        this.logger.log("Pasting blob {}", e)();
        this.$nextTick(function () {
          pasteBlobToContentEditable(e, this.userMessage);
        });
      })
    }

    showSmileys: boolean = false;

    addImage() {
      this.imgInput.click();
    }

    navDeleteMessage() {
      this.editMessageWs(null, [], this.editedMessage.messageId, this.editedMessage.roomId, null, null);
    }

    navEditMessage() {
      this.store.setEditedMessage({...this.editedMessage, isEditingNow: true});
    }

    closeEditing() {
      this.store.setEditedMessage(null);
    }

    handleAddVideo(file: Blob) {
      this.srcVideo = null;
      this.recordingNow = false;
      this.video.pause();
      if (file) {
        pasteBlobVideoToTextArea(file, this.userMessage, 'm', (e :string)=> {
          this.store.growlError(e)
        });
      }
    }

    handleRecord({src, isVideo}: {src: string, isVideo: boolean}) {
      this.recordingNow = true;
      if (isVideo) {
        this.srcVideo = src;
      }
    }

    handleAddAudio(file: Blob) {
      this.recordingNow = false;
      if (file) {
        pasteBlobAudioToTextArea(file, this.userMessage);
      }
    }

    dropPhoto(evt: DragEvent) {

      let files : FileList = <FileList><unknown>(oc(evt).dataTransfer.files);
      this.logger.debug("Drop photo {} ", files)();
      if (files) {
        for (var i = 0; i < files.length; i++) {
          this.logger.debug("loop")();
          var file = files[i];
          if (file.type.indexOf("image") >= 0) {
            pasteImgToTextArea(file, this.userMessage, (err: string) => {
              this.store.growlError(err)
            });
          } else {
            webrtcApi.offerFile(file, this.activeRoom.id);
          }
        }
      }
    }

    handleFileSelect (evt: Event) {
      let files: FileList = (<HTMLInputElement>evt.target).files!;
      for (let i = 0; i < files.length; i++) {
        pasteImgToTextArea(files[i], this.userMessage, (err: string) => {
          this.store.growlError(err)
        });
      }
      this.imgInput.value = "";
    };


    addSmiley(code: string) {
      this.logger.log("Adding smiley {}", code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.userMessage);
    }

    checkAndSendMessage(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        event.preventDefault();
        this.logger.debug("Checking sending message")();
        if (this.editedMessage && this.editedMessage.isEditingNow) {
          let md: MessageDataEncode = getMessageData(this.userMessage, this.editingMessageModel.symbol!);
          this.appendPreviousMessagesFiles(md, this.editedMessage.messageId);
          this.editMessageWs(md.messageContent, md.files, this.editedMessage.messageId, this.activeRoomId, md.currSymbol, md.fileModels);
        } else {
          let md: MessageDataEncode = getMessageData(this.userMessage);
          this.sendNewMessage(md);
        }
      } else if (event.keyCode === 27) { // 27 = escape
        this.showSmileys = false;
        if (this.editedMessage) {
          this.userMessage.innerHTML = "";
          this.store.setEditedMessage(null);

        }
      } else if (event.keyCode === 38 && this.userMessage.innerHTML == "") { // up arrow
        let messages = this.activeRoom.messages;
        if (Object.keys(messages).length > 0) {
          let maxTime: MessageModel |null= null;
          for (let m in messages ) {
            if (!maxTime || (messages[m].time >= maxTime.time)) {
              maxTime = messages[m];
            }
          }
          sem(event, maxTime!, true, this.userInfo, this.store.setEditedMessage);
        }
      }
    }


    private sendNewMessage(md: MessageDataEncode) {
      if (!md.messageContent && !md.files.length) {
        return
      }
      let now = Date.now();
      let id = -this.$ws.getMessageId();
      let mm: MessageModel = {
        roomId: this.activeRoomId,
        deleted: false,
        id,
        time: now - this.$ws.timeDiff,
        content: md.messageContent,
        symbol: md.currSymbol,
        giphy: null,
        edited: 0,
        files: md.fileModels,
        userId: this.userInfo.userId,
        transfer: {
          upload: null,
          error: null
        }
      };
      this.store.addMessage(mm);
      channelsHandler.sendSendMessage(md.messageContent!, this.activeRoomId, md.files, id, now);
    }

    private editMessageWs(
        messageContent: string|null,
        uploadFiles: UploadFile[],
        messageId: number,
        roomId: number,
        symbol: string|null,
        files: {[id: number]: FileModel}|null): void {
        let mm: MessageModel = {
          roomId,
          deleted: !messageContent,
          id: messageId,
          transfer: !!messageContent || messageId > 0 ? {
            error: null,
            upload: null
          } : null,
          time: this.editingMessageModel.time,
          content: messageContent,
          symbol: symbol,
          giphy: null,
          edited: this.editingMessageModel.edited ? this.editingMessageModel.edited + 1 : 1,
          files,
          userId: this.userInfo.userId
        };
      this.store.addMessage(mm);
      if (messageId < 0 && messageContent) {
        channelsHandler.sendSendMessage(messageContent, roomId, uploadFiles, messageId, this.editingMessageModel.time);
      } else if (messageId > 0 && messageContent) {
        channelsHandler.sendEditMessage(messageContent, roomId, messageId, uploadFiles);
      } else if (!messageContent && messageId > 0) {
        channelsHandler.sendDeleteMessage(messageId, -this.$ws.getMessageId());
      } else if(!messageContent && messageId < 0) {
        channelsHandler.removeSendingMessage(messageId);
      }
      this.store.setEditedMessage(null);
    }

    private appendPreviousMessagesFiles(md: MessageDataEncode, messageId: number) {
      if (!md.messageContent) {
        return
      }
      if (this.editingMessageModel.files) {
        for (let f in this.editingMessageModel.files) {
          if (md.messageContent.indexOf(f) >= 0) {
            md.fileModels[f] = this.editingMessageModel.files[f];
          }
        }
      }
      let messageFiles: UploadFile[] = channelsHandler.getMessageFiles(messageId);
      messageFiles.forEach(f => {
        if (md.messageContent!.indexOf(f.symbol) >= 0) {
          md.files.push(f);
        }
      });
    }
  }
</script>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

  .color-white .userMessageWrapper /deep/
    .usermsg
      background-color: white
    .icon-picture, .icon-smile, .icon-webrtc-video
      color: #7b7979
  .noRoom
    justify-content: center
    align-items: center
    display: flex
    font-size: 30px
    margin-top: 30px
    > *
      text-align: center
      color: #8fadff
      cursor: pointer
      &:hover
        text-decoration: underline
  .usermsg /deep/ img[code]
    @extend %img-code

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
    /deep/ .recorded-audio
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

  .holder
    display: flex
    flex-direction: column

  .wrapper
    @include flex(1)
    @include display-flex
    min-height: 0
    overflow-y: auto
    position: relative
    @media screen and (max-width: $collapse-width)
      flex-direction: column-reverse

  =wrapper-inner
    @include display-flex
    flex: 1
    width: 100%

  .chatBoxHolder
    +wrapper-inner
    overflow-y: auto
    position: relative
    @include flex-direction(column)

  .videoHolder
    z-index: 2
    +wrapper-inner
    justify-content: center
    position: relative
    video, .audio-recording-now
      position: relative
      top: 50%
      transform: translateY(-50%)
    video
      border: 1px solid rgba(126, 126, 126, 0.5)
    .audio-recording-now
      height: 200px

</style>
