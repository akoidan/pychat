<template>
  <div class="holder">
    <chat-call
      :call-info="room.callInfo"
      :room-id="room.id"
    />
    <search-messages :room="room" />
    <div
      ref="chatbox"
      class="chatbox"
      :class="{'display-search-only': room.search.searchActive}"
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
        <fieldset
          v-else-if="message.fieldDay"
          :key="message.fieldDay"
        >
          <legend align="center">
            {{ message.fieldDay }}
          </legend>
        </fieldset>
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

@Component({
    components: {
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

    loading: boolean = false;

    @Ref()
    private readonly chatbox!: HTMLElement;

    scrollBottom: boolean = false;

    beforeUpdate() {
      let el = this.chatbox;
      if (el) { // checked, el could be missing
        this.scrollBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
      } else {
        this.scrollBottom = false;
      }
    }

    onEmitScroll() {
      this.$nextTick(function () {
        if (this.chatbox && this.scrollBottom) {
          this.chatbox.scrollTop = this.chatbox.scrollHeight;
          this.$logger.debug("Scrolling to bottom")();
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
      if (e.which === 33) {    // page up
        this.loadUpHistory(25);
      } else if (e.which === 38) { // up
        this.loadUpHistory(10);
      } else if (e.ctrlKey && e.which === 36) {
        this.loadUpHistory(35);
      } else if (e.shiftKey && e.ctrlKey && e.keyCode === 70) {
        let s = this.room.search;
        this.$store.setSearchTo({
          roomId: this.room.id,
          search: {
            searchActive: !s.searchActive,
            searchedIds: s.searchedIds,
            locked: s.locked,
            searchText: s.searchText
          }
        });
      }
    };

    get minIdCalc(): number|undefined {
      return this.$store.minId(this.room.id);
    }

    @ApplyGrowlErr({runningProp: 'loading', message: 'Unable to load history'})
    private async loadUpHistory(n: number) {
      if (this.chatbox.scrollTop !== 0) {
        return; // we're just scrolling up
      }
      let s = this.room.search;
      if (s.searchActive && !s.locked) {
        let a: MessageModelDto[] = await this.$api.search(s.searchText, this.room.id, s.searchedIds.length);
        if (a.length) {
          this.$messageSenderProxy.getMessageSender(this.room.id).addMessages(this.room.id, a);
          let searchedIds = this.room.search.searchedIds.concat(a.map(a => a.id));
          this.$store.setSearchTo({
            roomId: this.room.id,
            search: {
              searchActive: s.searchActive,
              searchedIds,
              locked: a.length < MESSAGES_PER_SEARCH,
              searchText: s.searchText
            } as SearchModel
          });
        } else {
          this.$store.setSearchTo({
            roomId: this.room.id,
            search: {
              searchActive: s.searchActive,
              searchedIds: s.searchedIds,
              locked: true,
              searchText: s.searchText
            }
          });
        }
      } else if (!s.searchActive && !this.room.allLoaded) {
        await this.$ws.sendLoadMessages(this.room.id, this.minIdCalc, n);
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

  .holder
    height: 100%
    display: flex
    flex-direction: column // otherwise chat-call is not full width
    /deep/ p
      margin-top: 0.8em
      margin-bottom: 0.8em
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

  .color-white
    .message-self, .message-system, .message-others
      background-color: #f2fbff
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)
      color: black
      display: table
      padding: 0.4em
      border-radius: 4px
      margin-top: 0.4em
      margin-bottom: 0.4em
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
    fieldset legend
      color: #9DD3DD

  .color-reg .holder /deep/
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #84B7C0
    fieldset legend
      color: #9DD3DD




</style>
