<template>
  <div class="holder">
    <div class="wrapper">
      <div class="chatBoxHolder">
        <template  v-for="(room, id) in rooms">
          <chat-box :room-id="parseInt(id)" :room="room" :key="id" v-show="activeRoomId === parseInt(id)"/>
        </template>
      </div>
      <room-users/>
      <div id="smileParentHolder" class="padding10" v-show="false">
        <ul id="tabNames"></ul>
      </div>
    </div>

    <div class="userMessageWrapper" >
      <input type="file" accept="image/*,video/*" id="imgInput" multiple="multiple" v-show="false"/>
      <i class="icon-picture" id="imgInputIcon" title="Share Video/Image"></i>
      <i class="icon-smile" title="Add a smile :)" id="iconSmile"></i>
      <div contenteditable="true" class="usermsg input" @keydown="checkAndSendMessage"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";
  import RoomUsers from "./RoomUsers.vue"
  import ChatBox from "./ChatBox.vue"
  import {RoomModel} from '../../types';

  @Component({components: {RoomUsers, ChatBox}})
  export default class ChannelsPage extends Vue {
    @State growls: string[];
    @State theme;
    @State activeRoomId;
    @State rooms: {[id: string]: RoomModel};
    checkAndSendMessage() {

    }
  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"


  .chatbox img[code], .usermsg img[code]
    margin-top: -17px
    margin-bottom: -10px
    /*remove background if someones copies smile
    background-color: rgba(255, 255, 255, 0)
    vertical-align: middle


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
    #imgInputIcon
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

    .B4j2ContentEditableImg
      max-height: 200px
      max-width: 400px

    *
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