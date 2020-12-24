<template>
  <div class="holder" @drop.prevent="dropPhoto">
    <chat-call
      :call-info="room.callInfo"
      :room-id="room.id"
    />
    <search-messages :room="room" />
    <div
      ref="chatboxSearch"
      class="chatbox"
      :class="{'hidden': !room.search.searchActive}"
      tabindex="1"
      @keydown="keyDownSearchLoadUp"
      @mousewheel="onSearchScroll"
    >
      <template
        v-for="message in searchMessages">
        <app-separator
          v-if="message.fieldDay"
          :key="message.fieldDay"
          :day="message.fieldDay"
        />
        <chat-message v-else :key="message.id" :message="message" class="message-content" />
      </template>
    </div>
    <div
      ref="chatbox"
      class="chatbox"
      :class="{'hidden': room.search.searchActive || (room.callInfo.callContainer && room.callInfo.sharePaint)}"
      tabindex="1"
      @keydown="keyDownLoadUp"
      @mousewheel="onScroll"
    >
      <template v-for="message in messages">
        <chat-user-action-message
          v-if="message.isUserAction"
          :key="message.time"
          :time="message.time"
          :user-id="message.userId"
          :action="message.action"
        />
        <chat-change-name-message
          v-else-if="message.isChangeName"
          :key="message.time"
          :time="message.time"
          :old-name="message.oldName"
          :new-name="message.newName"
        />
        <app-separator
          v-else-if="message.fieldDay"
          :key="message.fieldDay"
          :day="message.fieldDay"
        />
        <chat-sending-file
          v-else-if="message.transfers"
          :key="message.id"
          :sending-file="message"
        />
        <chat-receiving-file
          v-else-if="message.connId"
          :key="message.id"
          :receiving-file="message"
        />
        <chat-thread
          v-else-if="message.thread"
          :key="message.parent.id"
          :message="message.parent"
          :messages="message.messages"
        />
        <chat-sending-message
          v-else
          @quote="onquote"
          :key="message.id"
          :message="message"
        />
      </template>
    </div>
    <chat-text-area :room-id="room.id" ref="textarea"/>
  </div>
</template>
<script lang="ts">

import {
  Component,
  Prop,
  Ref,
  Watch,
  Vue
} from "vue-property-decorator";
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';
import ChatMessage from '@/vue/chat/ChatMessage.vue';
import SearchMessages from '@/vue/chat/SearchMessages.vue';
import {
  MessageModel,
  ReceivingFile,
  RoomModel,
  SearchModel,
  SendingFile
} from '@/ts/types/model';
import { MessageModelDto } from '@/ts/types/dto';

import { MESSAGES_PER_SEARCH } from '@/ts/utils/consts';
import AppProgressBar from '@/vue/ui/AppProgressBar.vue';
import ChatSendingMessage from '@/vue/chat/ChatSendingMessage.vue';
import ChatUserActionMessage from '@/vue/chat/ChatUserActionMessage.vue';
import ChatSendingFile from '@/vue/chat/ChatSendingFile.vue';
import ChatReceivingFile from '@/vue/chat/ChatReceivingFile.vue';
import ChatCall from '@/vue/chat/ChatCall.vue';
import ChatChangeNameMessage from '@/vue/chat/ChatChangeNameMessage.vue';
import AppSeparator from '@/vue/ui/AppSeparator.vue';
import ChatThread from '@/vue/chat/ChatThread.vue';
import ChatTextArea from '@/vue/chat/ChatTextArea.vue';

  @Component({
    components: {
      ChatTextArea,
      ChatThread,
      AppSeparator,
      ChatChangeNameMessage,
      ChatCall,
      ChatReceivingFile,
      ChatSendingFile,
      ChatUserActionMessage,
      ChatSendingMessage,
      AppProgressBar,
      ChatMessage,
      SearchMessages
    }
  })
  export default class ChatBox extends Vue {
    @Prop() room!: RoomModel;

    @State
    public readonly activeRoomId!: number;

    messageLoading: boolean = false;
    searchMessageLoading: boolean = false;

    @Ref()
    private readonly chatbox!: HTMLElement;

    @Ref()
    public textarea!: ChatTextArea;

    @Ref()
    private readonly chatboxSearch!: HTMLElement;

    scrollBottom: boolean = false;

    beforeUpdate() {
      let el = this.room.search.searchActive ? this.chatboxSearch : this.chatbox;
      if (el) { // checked, el could be missing
        this.scrollBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
      } else {
        this.scrollBottom = false;
      }
    }

    @Watch('activeRoomId')
    public onActivate() {
      if (this.activeRoomId === this.room.id) {
       this.$nextTick(() => {
         this.textarea.userMessage.focus();
       })
      }
    }

    onquote(m: MessageModel) {
      this.textarea.onEmitQuote(m);
    }

    dropPhoto(evt: DragEvent) {
      const files: FileList = (evt.dataTransfer?.files) as FileList;
      this.$logger.debug('Drop photo {} ', files)();
      if (files) {
        this.textarea.onEmitDropPhoto(files)
      }
    }

    onEmitScroll() {
      this.$nextTick(function () {
        if (this.scrollBottom) {
          if (this.room.search.searchActive && this.chatboxSearch) {
            this.$logger.debug("Scrolling chatboxSearch to bottom")();
            this.chatboxSearch.scrollTop = this.chatboxSearch.scrollHeight;
          } else if (this.chatbox) {
            this.$logger.debug("Scrolling chatbox to bottom")();
            this.chatbox.scrollTop = this.chatbox.scrollHeight;
          }
        }
      });
    }

    created() {
      this.$messageBus.$on('scroll',this.onEmitScroll);
    }

    destroyed() {
      this.$messageBus.$off('scroll',this.onEmitScroll);
    }

    get id() {
      return this.room.id;
    }

    get searchMessages() {
      let dates: {[id: string]: boolean} = {};
      let newArray: any[] = [];
      for (let m in this.room.search.messages) {
        let message = this.room.search.messages[m];
        let d = new Date(message.time).toDateString();
        if (!dates[d]) {
          dates[d] = true;
          newArray.push({fieldDay: d, time: Date.parse(d)});
        }
        newArray.push(message);
      }
      newArray.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      return newArray;
    }

    get messages() {
      let newArray: any[] = this.room.roomLog.map(value => ({
        isUserAction: true,
        ...value
      }));
      newArray.push(...this.room.changeName.map(value => ({isChangeName: true, ...value})));
      let dates: {[id: string]: boolean} = {};
      let messageDict: Record<number, {parent?: MessageModel, messages: (MessageModel|ReceivingFile|SendingFile)[]}> = {};
      for (let m in this.room.messages) {
        let message = this.room.messages[m];
        if (message.parentMessage) {
          if (!messageDict[message.parentMessage]) {
            messageDict[message.parentMessage] = {messages: []}
          }
          messageDict[message.parentMessage].messages.push(message)
        } else {
          if (!messageDict[message.id]) {
            messageDict[message.id] = {messages: []}
          }
          messageDict[message.id].parent = message;
          let d = new Date(message.time).toDateString();
          if (!dates[d]) {
            dates[d] = true;
            newArray.push({fieldDay: d, time: Date.parse(d)});
          }
        }
      }
      let missingThreadIds: number[]= [];
      for (let m in this.room.sendingFiles) {
        let sendingFile: SendingFile = this.room.sendingFiles[m];
        if (sendingFile.threadId) {
          if (messageDict[sendingFile.threadId]) {
            messageDict[sendingFile.threadId].messages.push(sendingFile);
          } else {
            missingThreadIds.push(sendingFile.threadId)
            this.$logger.warn(`Receiving file {} won't be dispayed as thread ${sendingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(sendingFile);
        }
      }
      for (let m in this.room.receivingFiles) {
        let receivingFile: ReceivingFile = this.room.receivingFiles[m];
        if (receivingFile.threadId) {
          if (messageDict[receivingFile.threadId]) {
            messageDict[receivingFile.threadId].messages.push(receivingFile);
          } else {
            missingThreadIds.push(receivingFile.threadId)
            this.$logger.warn(`Receiving file {} won't be dispayed as thread ${receivingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(receivingFile);
        }
      }
      Object.values(messageDict).forEach(v => {
        if (v.messages.length || v.parent?.isThreadOpened) {
          if (v.parent) {
            v.messages.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
            newArray.push({parent: v.parent, thread: true, messages: v.messages, time: v.parent.time});
          } else {
            let mesasges: MessageModel[] = v.messages.filter(m => (m as MessageModel)?.id) as MessageModel[];
            if (mesasges.length) {
              missingThreadIds.push(mesasges[0].parentMessage as number);
            }
            this.$logger.warn(`Skipping rendering messages ${mesasges.map(m => m.id)} as parent is not loaded yet`)()
          }
        } else {
          newArray.push(v.parent)
        }
      });
      if (missingThreadIds.length) {
        this.$messageSenderProxy.getMessageSender(this.room.id).loadMessages(this.room.id, missingThreadIds);
      }
      newArray.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      this.$logger.debug("Reevaluating messages in room #{}: {}", this.room.id, newArray)();
      return newArray;
    }

    keyDownLoadUp(e: KeyboardEvent) {
      this.loadHistoryWithEvent(e, n => this.loadUpHistory(n));
    }

    keyDownSearchLoadUp(e: KeyboardEvent) {
      this.loadHistoryWithEvent(e, n => this.loadUpSearchHistory(n));
    }

    loadHistoryWithEvent(e: KeyboardEvent, callback: (a: number) => void) {
      if (e.which === 33) {    // page up
        callback(25);
      } else if (e.which === 38) { // up
        callback(10);
      } else if (e.ctrlKey && e.which === 36) {
        callback(35);
      } else if (e.shiftKey && e.ctrlKey && e.keyCode === 70) {
        this.$store.toogleSearch({
          roomId: this.room.id
        });
      }
    }

    @ApplyGrowlErr({runningProp: 'searchMessageLoading',  preventStacking: true, message: 'Unable to load history'})
    private async loadUpSearchHistory(n: number) {
      if (this.chatboxSearch.scrollTop !== 0) {
        return; // we're just scrolling up
      }
      this.$messageSenderProxy.getMessageSender(this.room.id).loadUpSearchMessages(this.room.id, n);
    }

    @ApplyGrowlErr({runningProp: 'messageLoading', preventStacking: true, message: 'Unable to load history'})
    private async loadUpHistory(n: number) {
      if (this.chatbox.scrollTop !== 0) {
        return; // we're just scrolling up
      }
      this.$messageSenderProxy.getMessageSender(this.room.id).loadUpMessages(this.room.id, n);
    }

    onSearchScroll(e: WheelEvent) {
      // globalLogger.debug("Handling scroll {}, scrollTop {}", e, this.chatbox.scrollTop)();
      if (e.detail < 0 || e.deltaY < 0) {
        this.loadUpSearchHistory(10);
      }
    }

    onScroll(e: WheelEvent) {
      // globalLogger.debug("Handling scroll {}, scrollTop {}", e, this.chatbox.scrollTop)();
      if (e.detail < 0 || e.deltaY < 0) {
        this.loadUpHistory(10);
      }
    }
  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"
  @import "~@/assets/sass/partials/variables"
  .holder
    height: 100%
    display: flex
    flex-direction: column // otherwise chat-call is not full width
    /deep/ p
      padding: $space-between-messages $space-between-messages/4
      margin: 0
    /deep/ .message-header
      font-weight: bold

    /deep/ .message-self, /deep/ .message-others
      position: relative

  .chatbox
    overflow-y: scroll
    height: 100%
    min-height: 50px
    padding-left: 8px
    word-wrap: break-word
    font-size: 18px
    @include flex(1) // Fix Safari's 0 height

    &.hidden
      display: none
    &:focus
      outline: none


  .color-white
    .message-self, .message-system, .message-others
      background-color: #f2fbff
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)
      color: black
      display: table
      //padding: $space-between-messages/2
      border-radius: 4px
      //margin-top: $space-between-messages/2
      //margin-bottom: $space-between-messages/2
      /deep/ p
        margin: 0 !important
    .message-self
      margin-left: auto
      margin-right: 5px

  //.dummy //w/o this dim last message would jump on hover if we have scroll
    //margin-top: $space-between-messages

  .color-lor .holder /deep/
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #9DD3DD

  .color-reg .holder /deep/
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #84B7C0




</style>
