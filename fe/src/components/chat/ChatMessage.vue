<template>
  <p :class="mainCls" @contextmenu="contextmenu">
      <span class="message-header">
        <span class="timeMess" @click="quote">({{getTime}})</span>
        <span @contextmenu.prevent.stop="setActiveUser">{{username}}</span>: </span>
    <span class="message-text-style" v-html="encoded" ref="content"></span>
  </p>
</template>
<script lang="ts">
  import {Mutation, State, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {
    CurrentUserInfoModel,
    CurrentUserSettingsModel,
    EditingMessage,
    MessageModel,
    UserDictModel,
    UserModel
  } from "../../types/model";
  import {
    encodeHTML,
    encodeMessage,
    highlightCode,
    setImageFailEvents,
    setVideoEvent,
    setYoutubeEvent, timeToString
  } from "../../utils/htmlApi";
  import {sem} from '../../utils/utils';
  import {messageBus} from '../../utils/singletons';


  @Component
  export default class ChatMessage extends Vue {

    @State userSettings: CurrentUserSettingsModel;
    @State userInfo: CurrentUserInfoModel;
    @Prop() message: MessageModel;
    @State allUsersDict: UserDictModel;
    @State editedMessage : EditingMessage;
    @Mutation setEditedMessage: SingleParamCB<EditingMessage>;
    @Mutation setActiveUserId: SingleParamCB<number>;

    $refs: {
      content: HTMLElement
    };

    setActiveUser() {
      this.setActiveUserId(this.message.userId);
    }

    get id() {
      return this.message.id;
    }

    get username() {
      return this.allUsersDict[this.message.userId].user;
    }

    get getTime() {
      return timeToString(this.message.time);
    }

    get encoded() {
      return this.message.content ? encodeMessage(this.message) : encodeHTML("This message has been removed");
    }

    quote() {
      messageBus.$emit('quote', this.message);
    }

    contextmenu(event) {
      sem(event, this.message, false, this.userInfo, this.setEditedMessage);
    }

    updated() {
      this.$nextTick(function () {
        if (this.$refs.content) {
          this.seEvents();
        } else {
          this.logger.debug("Skipping event settings, because node is gone")();
        }
      });
    }

    mounted() {
      this.seEvents()
    }

    private seEvents() {
      this.logger.debug("Setting events")();
      if (this.userSettings.highlightCode) {
        highlightCode(this.$refs.content);
      }
      if (this.userSettings.embeddedYoutube) {
        setYoutubeEvent(this.$refs.content)
      }
      setVideoEvent(this.$refs.content);
      setImageFailEvents(this.$refs.content, messageBus);
    }

    encodeMessage(message: MessageModel) {
      return encodeMessage(message);
    }

    get mainCls() {
      return {
        "message-self": this.isSelf,
        "message-others": !this.isSelf,
        "removed-message": this.message.deleted,
        "highLightMessage": this.isEditing,
      }
    }

    get isSelf() {
      return this.message.userId === this.userInfo.userId;
    }

    get isEditing() {
      return this.editedMessage && this.editedMessage.messageId === this.message.id;
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

  .highLightMessage
    border: 1px solid grey
    border-radius: 3px
    margin-right: 6px
    padding: 5px


  .removed-message .message-text-style
    color: #5d5d5d
    text-decoration: line-through

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
        cursor: pointer
        max-width: 100%
        max-height: 100%
        bottom: 50%
        right: 50%
        margin-bottom: -50px
        margin-right: -55px
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
      color: $link-color
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

    /deep/ .giphy
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

    /deep/ .B4j2ContentEditableImg
      @include margin-img-def
      @include margin-img
      &.failed
        min-width: 200px
        min-height: 100px
        + div.icon-youtube-play
          width: 50px
          margin-right: -30px

  .color-lor p /deep/, .color-reg p /deep/
    @import "~highlightjs/styles/railscasts"
  .color-white p /deep/
    @import "~highlightjs/styles/default"



  .timeMess
    @media screen and (max-width: 400px)
      display: none !important
    &:hover
      cursor: pointer
      color: #979797

  .color-white
    .timeMess
      color: #85d379
      font-weight: normal
    .highLightMessage
      border: 1px solid #3f3f3f
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5), 0 3px 10px 0 rgba(0,0,0,0.5)
    .message-others
      background-color: white
</style>