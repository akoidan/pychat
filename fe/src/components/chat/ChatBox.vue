<template>
  <div class="holder">
    <div class="search" v-show="showSearch">
      <input type="search"/>
      <div class="search-loading"></div>
      <div class="search_result hidden"></div>
    </div>
    <div class="chatbox" tabindex="1" @mousewheel="onScroll" ref="chatbox">
      <p :class="getClass(message)" :key="message.id" v-for="message in room.messages">
      <span class="message-header">
        <span class="timeMess">({{getTime(message.time)}})</span>
        <span>{{allUsers[message.userId].user}}</span>: </span>
        <span class="message-text-style">{{message.content}}</span></p>
    </div>
  </div>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfo, MessageModel, RoomModel, UserModel} from "../../types";
  import {globalLogger, ws} from "../../utils/singletons";

  @Component
  export default class ChatBox extends Vue {
    @Prop() roomId: number;
    @State allUsers: { [id: number]: UserModel };
    @State userInfo: CurrentUserInfo;
    @Prop() room: RoomModel;
    @Getter maxId;
    showSearch: boolean = false;
    loading: boolean = false;
    $refs: {
      chatbox: HTMLElement
    };

    getTime(timeMillis: number) {
      let date = new Date(timeMillis);
      return [this.sliceZero(date.getHours()), this.sliceZero(date.getMinutes()), this.sliceZero(date.getSeconds())].join(':');
    }

    onScroll(e) {
      globalLogger.log("Handling scroll {}, scrollTop {}", e, this.$refs.chatbox.scrollTop)();
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

    getClass(message: MessageModel) {
      return message.userId === this.userInfo.userId ? "message-self" : "message-others";
    }

    sliceZero(number: number, count: number = -2) {
      return String("00" + number).slice(count);
    }

  }
</script>

<style lang="sass" scoped>

  @import "partials/mixins"

  .message-header
    font-weight: bold

  .color-lor
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #9DD3DD
  .color-reg
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #84B7C0
  .color-white
    .message-others
      background-color: white

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

    .quote
      border-left: 5px solid #4d4d4d
      padding-left: 5px
      margin: 5px
      span
        font-weight: bold

    &:focus
      outline: none
    a:hover
      text-decoration: underline
    &.display-search-only
      >:not(.filter-search)
        display: none

    pre
      margin: 10px
      max-width: calc(100% - 15px)
      overflow-x: auto

    @mixin margin-img
      margin: 5px 0 0 15px
    @mixin margin-img-def
      max-width: calc(100% - 25px)
      max-height: 400px
      display: block

    .video-player-ready
      border: none
      @include margin-img-def
      width: 500px
      height: 350px
      @include margin-img

    %img-play
      @extend %user-select-none
      display: block
      @include margin-img
      > div
        position: relative
        display: inline-block
        zoom: 1
        &:not(:hover)
          -webkit-filter: brightness(90%)

        img
          @include margin-img-def
        .icon-youtube-play
          position: absolute
          z-index: 13
          top: 50%
          left: 50%
          margin-top: -50px
          margin-left: -55px
          font-size: 50px
          color: black
          height: 100px
          width: 100px
          @media screen and (max-width: $collapse-width)
            margin-top: -35px
            margin-left: -45px
            height: 70px
            width: 70px
    .youtube-player
      @extend %img-play
    .video-player
      @extend %img-play

    .giphy
      position: relative
      img
        @include margin-img-def
        @include margin-img
      &:not(:hover) .giphy_hover
        display: none
      .giphy_hover
        bottom: 5px
        position: absolute
        left: 20px
        width: 100px
        height: 36px

    .B4j2ContentEditableImg
      @include margin-img-def
      @include margin-img
    p
      margin-top: 0.8em
      margin-bottom: 0.8em
</style>