<template>
  <div class="holder">
    <nav-edit-message v-if="editedMessage" :edited-message="editedMessage" />
    <nav-user-show v-if="activeUser" :active-user="activeUser"/>
    <div class="wrapper">
      <div class="chatBoxHolder" @drop.prevent="dropPhoto">
        <template v-for="room in roomsArray">
          <chat-box :room="room" :key="room.id" v-show="activeRoomId === room.id"/>
        </template>
        <div v-if="!activeRoom" class="noRoom" >
          <router-link to="/chat/1">This room doesn't exist, or you don't have access to it. Click to go to main room</router-link>
        </div>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" v-on:add-smiley="addSmiley"/>
    </div>

    <div class="userMessageWrapper" >
      <input type="file" @change="handleFileSelect" accept="image/*,video/*" ref="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" title="Share Video/Image" @click="addImage"></i>
      <i class="icon-smile" title="Add a smile :)" @click="showSmileys = !showSmileys"></i>
      <div contenteditable="true" ref="userMessage" class="usermsg input" @keydown="checkAndSendMessage"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue, Watch} from "vue-property-decorator";
  import {Action, Getter, State, Mutation} from "vuex-class";
  import RoomUsers from "./RoomUsers.vue"
  import ChatBox from "./ChatBox.vue"
  import SmileyHolder from "./SmileyHolder.vue"
  import {
    CurrentUserInfoModel,
    EditingMessage,
    MessageModel,
    RoomModel,
    SentMessageModel,
    UploadProgressModel
  } from "../../types/model";
  import {
    encodeP,
    getMessageData,
    getSmileyHtml,
    getUniqueId,
    pasteHtmlAtCaret,
    pasteImgToTextArea, Utils
  } from "../../utils/htmlApi";
  import NavEditMessage from './NavEditMessage.vue';
  import NavUserShow from './NavUserShow.vue';
  import {sem} from '../../utils/utils';
  import {
    AddMessagePayload,
    MessageDataEncode, RemoveMessageProgress,
    SetMessageProgress,
    SetMessageProgressError,
    UploadFile
  } from "../../types/types";
  import {channelsHandler} from '../../utils/singletons';

  @Component({components: {RoomUsers, ChatBox, SmileyHolder, NavEditMessage, NavUserShow}})
  export default class ChannelsPage extends Vue {
    @Getter activeUser;
    @State editedMessage: EditingMessage;
    @State userInfo: CurrentUserInfoModel;
    @State activeRoomId: number;
    @Getter roomsArray: RoomModel[];
    @Getter maxId: SingleParamCB<number>;
    @Getter activeRoom: RoomModel;
    @Getter editingMessageModel: MessageModel;
    @Action growlError;
    // used in mixin from event.keyCode === 38
    @Mutation setEditedMessage: SingleParamCB<EditingMessage>;
    @Mutation addSentMessage;
    @Mutation addMessage;
    @Mutation setMessageProgress;
    @Mutation setMessageProgressError;
    @Mutation removeMessageProgress;

    $refs: {
      userMessage: HTMLTextAreaElement;
      imgInput: HTMLInputElement;
    };

    @Watch('editedMessage')
    onActiveRoomIdChange(val: EditingMessage) {
      this.logger.log("editedMessage changed")();
      if (val && val.isEditingNow) {
        this.$refs.userMessage.innerHTML = encodeP(this.editingMessageModel);
        this.$refs.userMessage.focus();
      }
    }

    showSmileys: boolean = false;

    addImage() {
      this.$refs.imgInput.click();
    }

    dropPhoto(evt) {
      this.logger.debug("Drop photo {} ", evt.dataTransfer.files)();
      if (evt.dataTransfer.files) {
        this.logger.debug("if")();
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
        this.sendWsMessage();
      } else if (event.keyCode === 27) { // 27 = escape
        this.showSmileys = false;
        if (this.editedMessage) {
          this.$refs.userMessage.innerHTML = "";
          this.setEditedMessage(null);

        }
      } else if (event.keyCode === 38 && this.$refs.userMessage.innerHTML == "") { // up arrow
        let ms = this.activeRoom.messages;
        if (ms.length > 0) {
          let m = ms[ms.length-1];
          sem(event, m, true, this.userInfo, this.setEditedMessage);
        }
      }
    }

    private sendWsMessage() {
      this.logger.debug("Checking sending message")();
      let messageId = this.editedMessage && this.editedMessage.isEditingNow ? this.editedMessage.messageId : null;
      let currSymbol;
      if (messageId) {
        currSymbol = this.editingMessageModel.symbol;
      }
      if (!currSymbol) {
        currSymbol = "\u3500"
      }
      let arId = this.activeRoomId;
      let um = this.$refs.userMessage;
      let md: MessageDataEncode= getMessageData(currSymbol, um);
      if (!md.messageContent && !md.files.length) {
        return
      }
      let now = Date.now();
      let id =  this.$ws.getMessageId();
      let upload: UploadProgressModel = null;
      let mm: SentMessageModel;
      if (messageId) {
        upload = channelsHandler.sendEditMessage(md.messageContent, arId, messageId, md.files, id);
        if (this.editingMessageModel.files) {
          Object.assign(md.fileModels, this.editingMessageModel.files);
        }
        mm = {
          roomId: arId,
          deleted: false,
          id: messageId,
          sending: true,
          time: this.editingMessageModel.time,
          content: md.messageContent,
          symbol: md.currSymbol,
          giphy: null,
          edited: this.editingMessageModel.edited,
          upload,
          files: md.fileModels,
          userId: this.userInfo.userId
        };
      } else {
        upload = channelsHandler.sendSendMessage(md.messageContent, arId, md.files, id, now);
        mm = {
          roomId: arId,
          deleted: false,
          id,
          sending: true,
          time: now,
          content: md.messageContent,
          symbol: md.currSymbol,
          giphy: null,
          edited: 0,
          upload,
          files: md.fileModels,
          userId: this.userInfo.userId
        };
      }
      this.addSentMessage(mm);
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
      position: absolute
      height: 16px
      top: 13px
    .icon-smile
      @include chat-icon
      right: 10px
    .icon-picture
      @include chat-icon
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


  .chatBoxHolder
    overflow-y: auto
    @include display-flex
    flex: 1
    @include flex-direction(column)
    width: 100%

</style>