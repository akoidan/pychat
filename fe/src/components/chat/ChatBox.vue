<template>
  <div class="holder">
    <search-messages :room="room"/>
    <div class="chatbox" @keydown="keyDownLoadUp" :class="{'display-search-only': room.search.searchActive}" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <template v-for="message in messages">
        <chat-change-online-message v-if="message.isChangeOnline" :key="message.time" :time="message.time" :user-id="message.userId" :is-went-online="message.isWentOnline"/>
        <fieldset v-else-if="message.fieldDay" :key="message.fieldDay">
          <legend align="center">{{message.fieldDay}}</legend>
        </fieldset>
        <chat-sending-file v-else-if="message.connId" :sending-file="message"/>
        <chat-sending-message v-else :message="message" :key="message.id"/>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
  import {Action, Getter, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import ChatMessage from "./ChatMessage.vue";
  import SearchMessages from "./SearchMessages.vue";
  import {RoomModel, SearchModel, SendingFile} from "../../types/model";
  import {MessageModelDto} from "../../types/dto";
  import {channelsHandler, messageBus} from "../../utils/singletons";
  import {SetSearchTo} from "../../types/types";
  import {MESSAGES_PER_SEARCH} from "../../utils/consts";
  import AppProgressBar from "../ui/AppProgressBar";
  import ChatSendingMessage from "./ChatSendingMessage";
  import ChatChangeOnlineMessage from "./ChatChangeOnlineMessage";
  import ChatSendingFile from "./ChatSendingFile";

  @Component({
    components: {
      ChatSendingFile,
      ChatChangeOnlineMessage,
      ChatSendingMessage,
      AppProgressBar,
      ChatMessage,
      SearchMessages
    }
  })
  export default class ChatBox extends Vue {
    @Prop() room: RoomModel;
    @Action growlError;
    @Getter minId;
    @Mutation setSearchTo;

    loading: boolean = false;
    $refs: {
      chatbox: HTMLElement
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

    created() {
      messageBus.$on('scroll', () => {
        this.$nextTick(function () {
          if (this.$refs.chatbox && this.scrollBottom) {
            this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
            this.logger.trace("Scrolling to bottom")();
          }
        });
      })
    }

    get id() {
      return this.room.id;
    }

    get messages() {
      let newArray: any[] = this.room.changeOnline.map(value => ({isChangeOnline: true, ...value}));
      let dates = {};
      for (let m in this.room.sendingFiles) {
        let sendingFile: SendingFile = this.room.sendingFiles[m];
        newArray.push(sendingFile);
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
      this.logger.debug("Reevaluating messages in room #{}: {}", this.room.id, newArray)();
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

    get minIdCalc() {
      return this.minId(this.room.id);
    }

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
          this.$ws.sendLoadMessages(this.room.id, this.minIdCalc, n, () => {
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
  }
</script>

<style lang="sass" scoped>

  $img-path: "../../assets/img"
  @import "partials/mixins"
  @import "partials/abstract_classes"

  .holder
    height: 100%
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


</style>