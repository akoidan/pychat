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
        <div>
          <video :src="srcVideo"  autoplay="" ref="video" v-show="isRecordingVideo && dim"></video>
        </div>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" @add-smiley="addSmiley"/>
    </div>

    <div class="userMessageWrapper" >
      <input type="file" @change="handleFileSelect" accept="image/*,video/*" ref="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" title="Share Video/Image" @click="addImage"></i>
      <i class="icon-smile" title="Add a smile :)" @click="showSmileys = !showSmileys"></i>
      <div @contextmenu.prevent @drag.prevent="" @mouseup="releaseRecord" @mouseout="releaseRecord" @mousedown="switchRecord" @touchstart="switchRecord" @touchend="releaseRecord">
        <i class="icon-webrtc-video" title="Hold on to send video" v-show="isRecordingVideo"></i>
        <i class="icon-mic-1" title="Hold on to send audio" v-show="!isRecordingVideo"></i>
      </div>
      <div contenteditable="true" ref="userMessage" class="usermsg input" @keydown="checkAndSendMessage"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue, Watch} from "vue-property-decorator";
  import {Action, Getter, Mutation, State} from "vuex-class";
  import RoomUsers from "./RoomUsers.vue"
  import ChatBox from "./ChatBox.vue"
  import SmileyHolder from "./SmileyHolder.vue"
  import {
    CurrentUserInfoModel,
    EditingMessage,
    FileModel,
    MessageModel,
    RoomModel,
    UploadProgressModel
  } from "../../types/model";
  import {
    encodeHTML,
    encodeMessage,
    encodeP,
    getMessageData,
    getSmileyHtml, pasteBlobToContentEditable,
    pasteHtmlAtCaret,
    pasteImgToTextArea, placeCaretAtEnd, stopVideo, timeToString
  } from "../../utils/htmlApi";
  import NavEditMessage from "./NavEditMessage.vue";
  import NavUserShow from "./NavUserShow.vue";
  import {sem} from "../../utils/utils";
  import {MessageDataEncode, RemoveSendingMessage, UploadFile} from "../../types/types";
  import {channelsHandler, globalLogger, messageBus} from "../../utils/singletons";
  import store from '../../store';


  const timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;
  const HOLD_TIMEOUT = 500;
  @Component({components: {RoomUsers, ChatBox, SmileyHolder, NavEditMessage, NavUserShow}})
  export default class ChannelsPage extends Vue {
    @State editedMessage: EditingMessage;
    @State allUsersDict: EditingMessage;
    @State userInfo: CurrentUserInfoModel;
    @State activeRoomId: number;
    @State dim: boolean;
    @Getter roomsArray: RoomModel[];
    @Getter activeUser;
    @Getter activeRoom: RoomModel;
    @Getter editingMessageModel: MessageModel;
    @Action growlError;
    // used in mixin from event.keyCode === 38
    @Mutation setEditedMessage: SingleParamCB<EditingMessage>;
    @Mutation addMessage;
    @Mutation setDim;
    isRecordingVideo = true;

    // started: number = null;
    timeout: number = 0;
    stream: MediaStream;
    srcVideo: string = null;

    $refs: {
      userMessage: HTMLElement;
      imgInput: HTMLInputElement;
      video: HTMLVideoElement;
    };

    switchRecord() {
      this.logger.debug("switch recrod...")();
      // this.started = Date.now();
      this.timeout = setTimeout(() => {
        this.startRecord();
        this.logger.debug("switch record timeouted...")();
        this.timeout = null;
      }, HOLD_TIMEOUT);
    }

    private stopVideo() {
      this.stream
      stopVideo(this.stream);
      this.stream = null;
      this.$refs.video.play();
    }



    startRecord() {
      this.logger.debug("Starting recording...")();
      this.setDim(true)
      navigator.getUserMedia({video: this.isRecordingVideo, audio: true}, (localMediaStream: MediaStream) => {
        this.stream = localMediaStream; // stream available to console
        this.srcVideo = URL.createObjectURL(localMediaStream);
        this.$refs.video.play();
      }, (error) => {
        this.logger.error("navigator.getUserMedia error: {}", error)();
      });


    }

    finishRecord() {
      this.logger.debug("Finishing recording...")();
      this.setDim(false);
      this.stopVideo();
    }

    releaseRecord() {
      this.logger.debug("releaseRecord now {}, timeout {}", this.dim, this.timeout)();
      if (this.dim) {
        this.finishRecord();
      } else if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
        this.isRecordingVideo = !this.isRecordingVideo;
      }
    }



    @Watch('editedMessage')
    onActiveRoomIdChange(val: EditingMessage) {
      this.logger.log("editedMessage changed")();
      if (val && val.isEditingNow) {
        this.$refs.userMessage.innerHTML = encodeP(this.editingMessageModel);
        placeCaretAtEnd(this.$refs.userMessage);
      }
    }

    beforeRouteEnter(to, frm, next) {
      next(vm => {
        messageBus.$emit("main-join");
      });
    }

    created() {
      messageBus.$on('quote', (message :MessageModel) => {
        this.$refs.userMessage.focus();
        let oldValue = this.$refs.userMessage.innerHTML;
        let match = oldValue.match(timePattern);
        let user = this.allUsersDict[message.userId];
        oldValue = match ? oldValue.substr(match[0].length + 1) : oldValue;
        this.$refs.userMessage.innerHTML = encodeHTML(`(${timeToString(message.time)}) ${user.user}: `) + encodeP(message) + encodeHTML(' >>>') + String.fromCharCode(13) +' '+ oldValue;
        placeCaretAtEnd(this.$refs.userMessage);
      });
      messageBus.$on("blob", (e: Blob) => {
        this.logger.error("Pasting blob {}", e)();
        this.$nextTick(function () {
          pasteBlobToContentEditable(e, this.$refs.userMessage);
        });
      })
    }

    // mounted() {
    //   this.isRecordingVideo = true;
    //   this.startRecord();
    // }

    showSmileys: boolean = false;

    addImage() {
      this.$refs.imgInput.click();
    }

    navDeleteMessage() {
      this.editMessageWs(null, [], this.editedMessage.messageId, this.editedMessage.roomId, null, null);
    }

    navEditMessage() {
      this.setEditedMessage({...this.editedMessage, isEditingNow: true});
    }

    closeEditing() {
      this.setEditedMessage(null);
    }

    dropPhoto(evt) {
      this.logger.debug("Drop photo {} ", evt.dataTransfer.files)();
      if (evt.dataTransfer.files) {
        for (var i = 0; i < evt.dataTransfer.files.length; i++) {
          this.logger.debug("loop")();
          var file = evt.dataTransfer.files[i];
          if (file.type.indexOf("image") >= 0) {
            pasteImgToTextArea(file, this.$refs.userMessage, err => {
              this.growlError(err);
            });
          } else {
            this.logger.error("Not implemented yet webrtc")();
          }
        }
      }
    }

    handleFileSelect (evt) {
      let files: File[] = evt.target.files;
      for (let i = 0; i < evt.target.files.length; i++) {
        pasteImgToTextArea(files[i], this.$refs.userMessage, err => {
          this.growlError(err);
        });
      }
      this.$refs.imgInput.value = "";
    };


    addSmiley(code: string) {
      this.logger.log("Adding smiley {}", code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.$refs.userMessage);
    }

    checkAndSendMessage(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        event.preventDefault();
        this.logger.debug("Checking sending message")();
        if (this.editedMessage && this.editedMessage.isEditingNow) {
          let md: MessageDataEncode = getMessageData(this.$refs.userMessage, this.editingMessageModel.symbol);
          this.appendPreviousMessagesFiles(md, this.editedMessage.messageId);
          this.editMessageWs(md.messageContent, md.files, this.editedMessage.messageId, this.activeRoomId, md.currSymbol, md.fileModels);
        } else {
          let md: MessageDataEncode = getMessageData(this.$refs.userMessage);
          this.sendNewMessage(md);
        }
      } else if (event.keyCode === 27) { // 27 = escape
        this.showSmileys = false;
        if (this.editedMessage) {
          this.$refs.userMessage.innerHTML = "";
          this.setEditedMessage(null);

        }
      } else if (event.keyCode === 38 && this.$refs.userMessage.innerHTML == "") { // up arrow
        let messages = this.activeRoom.messages;
        if (Object.keys(messages).length > 0) {
          let maxTime: MessageModel = null;
          for (let m in messages ) {
            if (!maxTime || (messages[m].time >= maxTime.time)) {
              maxTime = messages[m];
            }
          }
          sem(event, maxTime, true, this.userInfo, this.setEditedMessage);
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
        sending: true,
        time: Date.now(),
        content: md.messageContent,
        symbol: md.currSymbol,
        giphy: null,
        edited: 0,
        upload: null,
        files: md.fileModels,
        userId: this.userInfo.userId
      };
      this.addMessage(mm);
      channelsHandler.sendSendMessage(md.messageContent, this.activeRoomId, md.files, id, now);
    }

    private editMessageWs(
        messageContent: string,
        uploadFiles: UploadFile[],
        messageId: number,
        roomId: number,
        symbol: string,
        files: {[id: number]: FileModel}): void {
        let mm: MessageModel = {
          roomId,
          deleted: !messageContent,
          id: messageId,
          sending: !!messageContent || messageId > 0,
          time: this.editingMessageModel.time,
          content: messageContent,
          symbol: symbol,
          giphy: null,
          edited: this.editingMessageModel.edited + 1,
          upload: null,
          files,
          userId: this.userInfo.userId
        };
        this.addMessage(mm);
      if (messageId < 0 && messageContent) {
        channelsHandler.sendSendMessage(messageContent, roomId, uploadFiles, messageId, this.editingMessageModel.time);
      } else if (messageId > 0 && messageContent) {
        channelsHandler.sendEditMessage(messageContent, roomId, messageId, uploadFiles);
      } else if (!messageContent && messageId > 0) {
        channelsHandler.sendDeleteMessage(messageId, -this.$ws.getMessageId());
      } else if(!messageContent && messageId < 0) {
        channelsHandler.removeSendingMessage(messageId);
      }
      this.setEditedMessage(null);
    }

    private appendPreviousMessagesFiles(md: MessageDataEncode, messageId) {
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
        if (md.messageContent.indexOf(f.symbol) >= 0) {
          md.files.push(f);
        }
      });
    }
  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"
  @import "partials/abstract_classes"

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

    @mixin chat-icon
      display: inline
      float: right
      cursor: pointer
      position: absolute
      height: 16px
      top: 11px
    .icon-smile
      @include chat-icon
      right: 10px
    .icon-picture
      @include chat-icon
      left: 15px
    .icon-webrtc-video, .icon-mic-1
      @include chat-icon
      z-index: 2
      right: 30px
    .icon-webrtc-video
      font-size: 20px

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
    video
      position: relative
      top: 50%
      transform: translateY(-50%)
      border: 1px solid rgba(126, 126, 126, 0.5)

</style>