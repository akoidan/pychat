<template>
  <div class="holder">
    <div class="search" v-show="showSearch">
      <input type="search"/>
      <div class="search-loading"></div>
      <div class="search_result hidden"></div>
    </div>
    <div class="chatbox" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <template v-for="message in messages">
        <fieldset v-if="message.fieldDay">
          <legend align="center">{{message.fieldDay}}</legend>
        </fieldset>
        <chat-message v-else :key="message.id"  :message="message"/>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
  import {Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {RoomModel} from "../../types";
  import {globalLogger, ws} from "../../utils/singletons";
  import ChatMessage from "./ChatMessage.vue";

  @Component({components: {ChatMessage}})
  export default class ChatBox extends Vue {
    @Prop() roomId: number;
    @Prop() room: RoomModel;
    @Getter maxId;
    @Getter messagesFields;

    showSearch: boolean = false;
    loading: boolean = false;
    $refs: {
      chatbox: HTMLElement
    };

    scrollBottom: boolean = false;

    beforeUpdate() {
      let el = this.$refs.chatbox;
      this.scrollBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    }

    updated() {
      this.$nextTick(function () {
        if (this.scrollBottom) {
          this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
          // globalLogger.debug("Scrolling to bottom")();
        }
      })
    }

    get messages() {
      globalLogger.debug("Reevaluating messages")();
      let newArray = [];
      let dates = {};
      this.room.messages.forEach(m => {
        let d = new Date(m.time).toDateString();
        if (!dates[d]) {
          dates[d] = true;
          newArray.push({fieldDay: d});
        }
        newArray.push(m);
      });
      return newArray;
    }

    onScroll(e) {
      // globalLogger.debug("Handling scroll {}, scrollTop {}", e, this.$refs.chatbox.scrollTop)();
      if (!this.room.allLoaded
          && !this.loading
          && (e.detail < 0 || e.wheelDelta > 0)
          && this.$refs.chatbox.scrollTop === 0) {
        this.loading = true;
        ws.sendLoadMessages(this.roomId, this.maxId(this.roomId), 10, () => {
          this.loading = false;
        });
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


  .search
    padding: 5px
    > *
      display: inline-block
    input
      width: calc(100% - 10px)
    &.loading
      .search-loading
        margin-left: 5px
        margin-bottom: -5px
        margin-top: -3px
        @include spinner(3px, white)
      input
        width: calc(100% - 40px)

    .search_result
      display: flex
      justify-content: center
      padding-top: 10px


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

    &.display-search-only
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