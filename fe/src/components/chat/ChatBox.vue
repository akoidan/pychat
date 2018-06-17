<template>
  <div class="holder">
    <div class="search" v-show="showSearch">
      <input type="search">
      <div class="search-loading"></div>
      <div class="search_result hidden"></div>
    </div>
    <div class="chatbox" tabindex="1">
      <p :class="getClass(message)" :key="message.id" v-for="message in room.messages">
      <span class="message-header">
        <span class="timeMess">({{getTime(message.time)}})</span>
        <span userid="97">{{allUsers[message.userId]}}</span>: </span>
        <span class="message-text-style">{{message.content}}</span></p>
    </div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfo, MessageModel, RoomModel, UserModel} from "../../types";

  @Component
  export default class ChatBox extends Vue {
    @Prop() roomId: number;
    @State allUsers: { [id: number]: UserModel };
    @State userInfo: CurrentUserInfo;
    @Prop() room: RoomModel;
    showSearch: boolean = false;


    getTime(timeMillis: number) {
      var date = new Date(timeMillis);
      var time = [this.sliceZero(date.getHours()), this.sliceZero(date.getMinutes()), this.sliceZero(date.getSeconds())].join(':');
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