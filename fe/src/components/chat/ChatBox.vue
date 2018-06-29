<template>
  <div class="holder">
    <nav-edit-message
        v-if="editedMessage"
        :edited-message="editedMessage"
        @close="closeEditing"
        @delete-message="navDeleteMessage"
        @edit-message="navEditMessage"/>
    <search-messages :room="room"/>
    <div class="chatbox" @keydown="keyDownLoadUp" :class="{'display-search-only': room.search.searchActive}" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <template v-for="message in messages">
        <fieldset v-if="message.fieldDay">
          <legend align="center">{{message.fieldDay}}</legend>
        </fieldset>
        <chat-sending-message v-else :message="message" :key="message.id"/>
      </template>
    </div>
    <div class="userMessageWrapper" >
      <input type="file" @change="handleFileSelect" accept="image/*,video/*" ref="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" title="Share Video/Image" @click="addImage"></i>
      <i class="icon-smile" title="Add a smile :)" @click="showSmileys = !showSmileys"></i>
      <div contenteditable="true" ref="userMessage" class="usermsg input" @keydown="checkAndSendMessage"></div>
    </div>
  </div>
</template>
<script lang="ts">
  import {Action, Getter, Mutation, State} from "vuex-class";
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import ChatMessage from "./ChatMessage.vue";
  import SearchMessages from "./SearchMessages.vue";
  import {CurrentUserInfoModel, EditingMessage, MessageModel, RoomModel, SearchModel} from "../../types/model";
  import {MessageModelDto} from "../../types/dto";
  import {channelsHandler} from "../../utils/singletons";
  import {MessageDataEncode, RemoveSendingMessage, SetSearchTo, UploadFile} from "../../types/types";
  import {MESSAGES_PER_SEARCH} from "../../utils/consts";
  import AppProgressBar from "../ui/AppProgressBar";
  import ChatSendingMessage from "./ChatSendingMessage";
  import {encodeP, getMessageData, getSmileyHtml, pasteHtmlAtCaret, pasteImgToTextArea} from "../../utils/htmlApi";
  import NavEditMessage from "./NavEditMessage.vue";
  import NavUserShow from "./NavUserShow.vue";
  import {sem} from "../../utils/utils";

  @Component({components: {NavUserShow, NavEditMessage, ChatSendingMessage, AppProgressBar, ChatMessage, SearchMessages}})
  export default class ChatBox extends Vue {
    @Prop() room: RoomModel;

    @State editedMessage: EditingMessage;
    @State userInfo: CurrentUserInfoModel;

    @Getter maxId: SingleParamCB<number>;
    @Getter editingMessageModel: MessageModel;
    @Getter minId;

    // used in mixin from event.keyCode === 38
    @Mutation setEditedMessage: SingleParamCB<EditingMessage>;
    @Mutation addMessage;
    @Mutation deleteMessage;

    @Mutation setSearchTo;

    @Action growlError;



    loading: boolean = false;
    $refs: {
      chatbox: HTMLElement
      userMessage: HTMLTextAreaElement;
      imgInput: HTMLInputElement;
    };

    scrollBottom: boolean = false;

    beforeUpdate() {
      let el = this.$refs.chatbox;
      if (el) { // checked, el could be missing
        this.scrollBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
      } else {
        this.scrollBottom = false;
      }
    }

    get id() {
      return this.room.id;
    }
    get messages() {
      this.logger.debug("Reevaluating messages in room #{}", this.room.id)();
      let newArray = [];
      let dates = {};
      for (let m in this.room.messages) {
        let message = this.room.messages[m];
        let d = new Date(message.time).toDateString();
        if (!dates[d]) {
          dates[d] = true;
          newArray.push({fieldDay: d, time: Date.parse(d)});
        }
        newArray.push(message);
      }
      newArray.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      this.$nextTick(function () {
        if (this.$refs.chatbox && this.scrollBottom) {
          this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
          this.logger.debug("Scrolling to bottom")();
        }
      });
      return newArray;
    }

    keyDownLoadUp(e) {
      if (e.which === 33) {    // page up
        this.loadUpHistory(25);
      } else if (e.which === 38) { // up
        this.loadUpHistory(10);
      } else if (e.ctrlKey && e.which === 36) {
        this.loadUpHistory(35);
      } else if (e.shiftKey && e.ctrlKey && e.keyCode === 70) {
        let s = this.room.search;
        this.setSearchTo({
          roomId: this.room.id,
          search: {
            searchActive: !s.searchActive,
            searchedIds: s.searchedIds,
            locked: s.locked,
            searchText: s.searchText
          } as SearchModel
        } as SetSearchTo);
      }
    };

    private loadUpHistory(n) {
      if (!this.loading && this.$refs.chatbox.scrollTop === 0) {
        let s = this.room.search;
        if (s.searchActive && !s.locked) {
          this.loading = true;
          this.$api.search(s.searchText, this.room.id, s.searchedIds.length, (a: MessageModelDto[], e: string) => {
            this.loading = false;
            if (e) {
              this.growlError(e);
            } else if (a.length) {
              channelsHandler.addMessages(this.room.id, a);
              let searchedIds = this.room.search.searchedIds.concat(a.map(a => a.id));
              this.setSearchTo({
                roomId: this.room.id,
                search: {
                  searchActive: s.searchActive,
                  searchedIds,
                  locked: a.length < MESSAGES_PER_SEARCH,
                  searchText: s.searchText
                } as SearchModel
              } as SetSearchTo);
            } else {
              this.setSearchTo({
                roomId: this.room.id,
                search: {
                  searchActive: s.searchActive,
                  searchedIds: s.searchedIds,
                  locked: true,
                  searchText: s.searchText
                } as SearchModel
              } as SetSearchTo);
            }
          });
        } else if (!s.searchActive && !this.room.allLoaded) {
          this.loading = true;
          this.$ws.sendLoadMessages(this.room.id, this.minId(this.room.id), n, () => {
            this.loading = false;
          });
        }
      }
    }

    onScroll(e) {
      // globalLogger.debug("Handling scroll {}, scrollTop {}", e, this.$refs.chatbox.scrollTop)();
      if (e.detail < 0 || e.wheelDelta > 0) {
        this.loadUpHistory(10);
      }
    }


    @Watch('editedMessage')
    onActiveRoomIdChange(val: EditingMessage) {
      this.logger.log("editedMessage changed")();
      if (val && val.isEditingNow && val.roomId === this.room.id) {
        this.$refs.userMessage.innerHTML = encodeP(this.editingMessageModel);
        this.$refs.userMessage.focus();
      }
    }

    addImage() {
      this.$refs.imgInput.click();
    }

    navDeleteMessage() {
      let messageId = this.editedMessage.messageId;
      this.setEditedMessage(null);
      this.editMessageWs(null, null, messageId, this.editedMessage.roomId);
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


    checkAndSendMessage(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        event.preventDefault();
        this.logger.debug("Checking sending message")();
        if (this.editedMessage && this.editedMessage.isEditingNow) {
          let md: MessageDataEncode = getMessageData(this.$refs.userMessage, this.editingMessageModel.symbol);
          this.editMessage(md, this.editedMessage.messageId);
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
        let messages = this.room.messages;
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
        roomId: this.room.id,
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
      channelsHandler.sendSendMessage(md.messageContent, this.room.id, md.files, id, now);
    }

    private editMessage(md: MessageDataEncode, messageId) {
      this.appendPreviousMessagesFiles(md, messageId);
      if (md.messageContent) {
        let mm: MessageModel = {
          roomId: this.editingMessageModel.roomId,
          deleted: !md.messageContent,
          id: messageId,
          sending: true,
          time: this.editingMessageModel.time,
          content: md.messageContent,
          symbol: md.currSymbol,
          giphy: null,
          edited: this.editingMessageModel.edited + 1,
          upload: null,
          files: md.fileModels,
          userId: this.userInfo.userId
        };
        this.setEditedMessage(null);
        this.addMessage(mm);
      }
      this.editMessageWs(md.messageContent, md.files, messageId, this.room.id);
    }

    private editMessageWs(messageContent: string, files: UploadFile[], messageId: number, roomId) {
      if (!messageContent) {
        let rms: RemoveSendingMessage = {
          roomId,
          messageId
        };
        this.deleteMessage(rms);
        channelsHandler.removeSendingMessage(messageId);
      }
      if (messageId < 0 && messageContent) {
        channelsHandler.sendSendMessage(messageContent, roomId, files, messageId, this.editingMessageModel.time);
      } else if (messageId > 0 && messageContent) {
        channelsHandler.sendEditMessage(messageContent, roomId, messageId, files);
      } else if (!messageContent && messageId > 0) {
        channelsHandler.sendDeleteMessage(messageId, -this.$ws.getMessageId());
      }
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

  $img-path: "../../assets/img"
  @import "partials/mixins"
  @import "partials/abstract_classes"

  .holder
    height: 100%

  .chatbox
    overflow-y: scroll
    height: 100%
    min-height: 50px
    padding-left: 8px
    word-wrap: break-word
    font-size: 18px
    @include flex(1) // Fix Safari's 0 height

    &:focus
      outline: none

    &.display-search-only /deep/
      >:not(.filter-search)
        display: none


  fieldset
    border-top: 1px solid #e8e8e8
    border-bottom: none
    border-left: none
    border-right: none
    display: block
    text-align: center
    padding: 0
    margin-left: 3px
    margin-right: 10px

    legend
      padding: 0 10px
      font-weight: bold

  .color-lor fieldset legend
    color: #9DD3DD

  .color-reg fieldset legend
    color: #9DD3DD

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
</style>