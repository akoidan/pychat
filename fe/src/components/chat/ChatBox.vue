<template>
  <div class="holder">
    <search-messages :room="room"/>
    <div class="chatbox" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <template v-for="message in messages">
        <fieldset v-if="message.fieldDay">
          <legend align="center">{{message.fieldDay}}</legend>
        </fieldset>
        <chat-message v-else :key="message.id"  :message="message" :searched="room.searchedIds"/>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
  import {Getter} from "vuex-class";
  import {Component, Prop, Vue ,Watch } from "vue-property-decorator";
  import ChatMessage from "./ChatMessage.vue";
  import SearchMessages from "./SearchMessages.vue";
  import {RoomModel} from "../../types/model";

  @Component({components: {ChatMessage, SearchMessages}})
  export default class ChatBox extends Vue {
    @Prop() room: RoomModel;
    @Getter maxId;

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

    updated() {
      this.$nextTick(function () {
        if (this.scrollBottom) {
          this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
          // globalLogger.debug("Scrolling to bottom")();
        }
      })
    }

    get messages() {
      this.logger.debug("Reevaluating messages in room #{}", this.room.id)();
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
        this.$ws.sendLoadMessages(this.room.id, this.maxId(this.room.id), 10, () => {
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