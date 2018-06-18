<template>
  <p :class="getClass(message)">
      <span class="message-header">
        <span class="timeMess">({{getTime(message.time)}})</span>
        <span>{{allUsers[message.userId].user}}</span>: </span>
    <span class="message-text-style" v-html="encoded" ref="content"></span>
  </p>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfo, MessageModel, RoomModel, UserModel} from "../../types";
  import {globalLogger, ws} from "../../utils/singletons";
  import {encodeMessage} from '../../utils/htmlEncoder';
  import {highlightCode, setVideoEvent, setYoutubeEvent} from "../../utils/htmlApi";


  @Component
  export default class ChatMessage extends Vue {

    @State userInfo: CurrentUserInfo;
    @Prop() message: MessageModel;
    @State allUsers: { [id: number]: UserModel };

    $refs: {
      content: HTMLElement
    };

    getTime(timeMillis: number) {
      let date = new Date(timeMillis);
      return [this.sliceZero(date.getHours()), this.sliceZero(date.getMinutes()), this.sliceZero(date.getSeconds())].join(':');
    }

    get encoded() {
      return encodeMessage(this.message);
    }

    updated() {
      this.setEvents();
    }

    created() {
      this.setEvents();

    }

    private setEvents() {
      this.$nextTick(function () {
        if (this.userInfo.highlightCode) {
          highlightCode(this.$refs.content);
        }
        if (this.userInfo.embeddedYoutube) {
          setYoutubeEvent(this.$refs.content)
        }
        setVideoEvent(this.$refs.content);
      })
    }

    encodeMessage(message: MessageModel) {
      return encodeMessage(message);
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

  $img-path: "../../assets/img"
  @import "partials/mixins"
  @import "partials/abstract_classes"



  @mixin margin-img
    margin: 5px 0 0 15px
  @mixin margin-img-def
    max-width: calc(100% - 25px)
    max-height: 400px
    display: block



  %img-play-chat
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


  .message-text-style

    /deep/ .youtube-player
      @extend %img-play-chat
      @extend %img-play
    /deep/ .video-player
      @extend %img-play-chat
      @extend %img-play

    /deep/ :visited
      color: #7572CF
    /deep/ :link
      color: #729fcf
    /deep/ a
      &:hover
        text-decoration: underline

    /deep/ img[code]
      @extend %img-code

    /deep/ .quote
      border-left: 5px solid #4d4d4d
      padding-left: 5px
      margin: 5px
      span
        font-weight: bold
    /deep/ pre
      margin: 10px
      max-width: calc(100% - 15px)
      overflow-x: auto

    /deep/ .video-player-ready
      border: none
      @include margin-img-def
      width: 500px
      height: 350px
      @include margin-img


    /deep/  .giphy
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

  .message-header
    font-weight: bold

  .color-lor
    @import "~highlightjs/styles/railscasts.css"
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #9DD3DD
  .color-reg
    @import "~highlightjs/styles/railscasts.css"
    .message-others .message-header
      color: #729fcf
    .message-self .message-header
      color: #e29722
    .message-system .message-header
      color: #84B7C0
  .color-white
    @import "~highlightjs/styles/railscasts.css"
    .message-others
      background-color: white
</style>