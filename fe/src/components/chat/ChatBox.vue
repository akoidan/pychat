<template>
  <div class="holder">
    <search-messages :room="room"/>
    <div class="chatbox" @keydown="keyDownLoadUp" :class="{'display-search-only': room.search.searchActive}" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <template v-for="message in messages">
        <fieldset v-if="message.fieldDay">
          <legend align="center">{{message.fieldDay}}</legend>
        </fieldset>
        <chat-sending-message v-else :message="message" :key="message.id"/>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
  import {Getter, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue ,Watch } from "vue-property-decorator";
  import ChatMessage from "./ChatMessage.vue";
  import SearchMessages from "./SearchMessages.vue";
  import {RoomModel, SearchModel} from "../../types/model";
  import {MessageModelDto} from '../../types/dto';
  import {channelsHandler, globalLogger} from "../../utils/singletons";
  import {SetSearchTo} from '../../types/types';
  import {MESSAGES_PER_SEARCH} from '../../utils/consts';
  import AppProgressBar from '../ui/AppProgressBar';
  import ChatSendingMessage from './ChatSendingMessage';

  @Component({components: {ChatSendingMessage, AppProgressBar, ChatMessage, SearchMessages}})
  export default class ChatBox extends Vue {
    @Action growlError;
    @Getter minId;
    @Getter roomById;
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

    get id() {
      return this.$route.params['id'];
    }

    get room(): RoomModel {
      return this.roomById(this.id);
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


</style>