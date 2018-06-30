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
      <div class="chatBoxHolder" @drop.prevent="dropPhoto">
        <keep-alive>
          <router-view :key="$route.params['id']"></router-view>
        </keep-alive>
        <div v-if="!activeRoom" class="noRoom" >
          <router-link to="/chat/1">This room doesn't exist, or you don't have access to it. Click to go to main room</router-link>
        </div>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" @add-smiley="addSmiley"/>
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
  import {encodeP, getMessageData, getSmileyHtml, pasteHtmlAtCaret, pasteImgToTextArea} from "../../utils/htmlApi";
  import NavEditMessage from "./NavEditMessage.vue";
  import NavUserShow from "./NavUserShow.vue";
  import {sem} from "../../utils/utils";
  import {MessageDataEncode, RemoveSendingMessage, UploadFile} from "../../types/types";
  import {channelsHandler} from "../../utils/singletons";

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
    @Mutation addMessage;
    @Mutation deleteMessage;
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
          let maxId: MessageModel = null;
          for (let m in messages ) {
            if (!maxId || (messages[m].time >= maxId.time)) {
              maxId = messages[m];
            }
          }
          sem(event, maxId, true, this.userInfo, this.setEditedMessage);
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


  .chatBoxHolder
    overflow-y: auto
    @include display-flex
    flex: 1
    @include flex-direction(column)
    width: 100%

</style>