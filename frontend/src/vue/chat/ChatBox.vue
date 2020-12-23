<template>
  <div class="holder">
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
        <app-separator :day="message.fieldDay"   v-if="message.fieldDay" :key="message.fieldDay"/>
        <chat-sending-message
          v-else
          :key="message.id"
          :message="message"
        />
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
        <app-separator :day="message.fieldDay" v-if="message.fieldDay" :key="message.fieldDay"/>
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
        <chat-sending-message
          v-else
          :key="message.id"
          :message="message"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts">

import {
  Component,
  Prop,
  Ref,
  Vue
} from "vue-property-decorator";
import { ApplyGrowlErr } from '@/ts/instances/storeInstance';
import ChatMessage from '@/vue/chat/ChatMessage.vue';
import SearchMessages from '@/vue/chat/SearchMessages.vue';
import {
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

  @Component({
    components: {
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

    messageLoading: boolean = false;
    searchMessageLoading: boolean = false;

    @Ref()
    private readonly chatbox!: HTMLElement;

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
      for (let m in this.room.sendingFiles) {
        let sendingFile: SendingFile = this.room.sendingFiles[m];
        newArray.push(sendingFile);
      }
      for (let m in this.room.receivingFiles) {
        let receivingFile: ReceivingFile = this.room.receivingFiles[m];
        newArray.push(receivingFile);
      }
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

    get minIdCalc(): number|undefined {
      return this.$store.minId(this.room.id);
    }

    @ApplyGrowlErr({runningProp: 'searchMessageLoading',  preventStacking: true, message: 'Unable to load history'})
    private async loadUpSearchHistory(n: number) {
      if (this.chatboxSearch.scrollTop !== 0) {
        return; // we're just scrolling up
      }
      let search = this.room.search;
      if (!search.locked) {
        let messagesDto: MessageModelDto[] = await this.$api.search(search.searchText, this.room.id, Object.keys(search.messages).length);
        this.$logger.log("Got {} messages from the server", messagesDto.length)()
        if (messagesDto.length) {
          this.$messageSenderProxy.getMessageSender(this.room.id).addSearchMessages(this.room.id, messagesDto);
        }
        this.$store.setSearchStateTo({roomId: this.room.id, lock: messagesDto.length < MESSAGES_PER_SEARCH});
      }
    }

    @ApplyGrowlErr({runningProp: 'messageLoading', preventStacking: true, message: 'Unable to load history'})
    private async loadUpHistory(n: number) {
      if (this.chatbox.scrollTop !== 0) {
        return; // we're just scrolling up
      }
     if (!this.room.allLoaded) {
        let lm = await this.$ws.sendLoadMessages(this.room.id, this.minIdCalc, n);
        if (lm.content.length > 0) {
          this.$messageSenderProxy.getMessageSender(lm.roomId).addMessages(lm.roomId, lm.content);
        } else {
          this.$store.setAllLoaded(lm.roomId);
        }
      }
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
      margin-top: $space-between-messages
      margin-bottom: $space-between-messages
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
      padding: $space-between-messages/2
      border-radius: 4px
      margin-top: $space-between-messages/2
      margin-bottom: $space-between-messages/2
      /deep/ p
        margin: 0 !important
    .message-self
      margin-left: auto
      margin-right: 5px


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
