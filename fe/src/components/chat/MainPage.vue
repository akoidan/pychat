<template>
  <div class="holder">
    <div class="wrapper">
      <div class="chatBoxHolder">
        <template  v-for="(room, id) in rooms">
          <chat-box :room-id="parseInt(id)" :room="room" :key="id" v-show="activeRoomId === parseInt(id)"/>
        </template>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" v-on:add-smiley="addSmiley"/>
    </div>

    <div class="userMessageWrapper" >
      <input type="file" accept="image/*,video/*" id="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" title="Share Video/Image"></i>
      <i class="icon-smile" title="Add a smile :)" @click="showSmileys = !showSmileys"></i>
      <div contenteditable="true" ref="userMessage" class="usermsg input" @keydown="checkAndSendMessage"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State, Getter} from "vuex-class";
  import RoomUsers from "./RoomUsers.vue"
  import ChatBox from "./ChatBox.vue"
  import SmileyHolder from "./SmileyHolder.vue"
  import {RoomModel} from '../../types';
  import {pasteHtmlAtCaret} from '../../utils/htmlApi';
  import {channelsHandler, globalLogger} from "../../utils/singletons";
  import {getSmileyHtml} from '../../utils/htmlEncoder';

  @Component({components: {RoomUsers, ChatBox, SmileyHolder}})
  export default class ChannelsPage extends Vue {
    @State growls: string[];
    @State theme;
    @State activeRoomId;
    @State rooms: {[id: string]: RoomModel};
    @Getter maxId;

    $refs: {
      userMessage: HTMLTextAreaElement;
    };

    showSmileys: boolean = false;

    addSmiley(code: string) {
      globalLogger.log("Adding smiley {}", code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.$refs.userMessage);
    }

    checkAndSendMessage(event: KeyboardEvent) {
      if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
        event.preventDefault();
        channelsHandler.sendMessage(this.activeRoomId, this.$refs.userMessage);
      } else if (event.keyCode === 27) { // 27 = escape
        this.showSmileys = false;
        alert('todo');
        // self.removeEditingMode();
      } else if (event.keyCode === 38) { // up arrow
        alert('todo');
        // self.handleEditMessage(event);
      }
    }
  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"
  @import "partials/abstract_classes"


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
    color: white
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


  .chatBoxHolder
    @include display-flex
    @include flex-direction(column)
    width: 100%

</style>