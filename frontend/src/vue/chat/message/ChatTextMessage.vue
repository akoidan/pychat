<template>
  <chat-message-wrapper :time="message.time" :class="mainCls">
    <template #header>
      <chat-message-header
        class="header"
        :user-id="message.userId"
      />
    </template>
    <span
      ref="content"
      class="message-text-style"
      v-html="encoded"
    />
  </chat-message-wrapper>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Emit,
  Ref,
  Vue
} from 'vue-property-decorator';
import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  EditingMessage,
  MessageModel
} from '@/ts/types/model';
import {
  encodeHTML,
  encodeMessage,
  highlightCode,
  setAudioEvent,
  setImageFailEvents,
  setVideoEvent,
  setYoutubeEvent
} from '@/ts/utils/htmlApi';

import ChatMessageHeader from '@/vue/chat/message/ChatMessageHeader';
import ChatMessageWrapper from '@/vue/chat/message/ChatMessageWrapper';

@Component({
  name: 'ChatTextMessage' ,
  components: {ChatMessageWrapper, ChatMessageHeader}
})
export default class ChatTextMessage extends Vue {

  @Prop()
  public message!: MessageModel;

  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  @Ref()
  public content!: HTMLElement;

  get id() {
    return this.message.id;
  }

  get encoded() {
    return this.message.content ? encodeMessage(this.message, this.$store) : encodeHTML('This message has been removed');
  }

  get mainCls() {
    return {
      'removed-message': this.message.deleted,
      'message-content': true,
    };
  }

  public updated() {
    this.$nextTick(function () {
      if (this.content) {
        this.seEvents();
      } else {
        this.$logger.debug('Skipping event settings, because node is gone')();
      }
    });
  }

  public mounted() {
    this.seEvents();
  }

  private seEvents() {
    this.$logger.debug('Setting events')();
    if (this.userSettings.highlightCode) {
      highlightCode(this.content);
    }
    if (this.userSettings.embeddedYoutube) {
      setYoutubeEvent(this.content);
    }
    setVideoEvent(this.content);
    setImageFailEvents(this.content, this.$messageBus);
    setAudioEvent(this.content);
  }

}
</script>
<style lang="sass" scoped>

  @import "@/assets/sass/partials/mixins"
  @import "@/assets/sass/partials/abstract_classes"

  @mixin margin-img
    margin: 5px 0 0 15px

  @mixin margin-img-def
    max-width: calc(100% - 25px)
    max-height: 400px
    display: block

  .removed-message .message-text-style
    color: #5d5d5d
    text-decoration: line-through

  .message-content
    display: flex

  .header
    padding-right: 5px
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
        /*z-index: 13*/
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
    min-width: 0

    ::v-deep .emoji
      width: $emoji-width

    ::v-deep .youtube-player
      @extend %img-play-chat
      @extend %img-play
    ::v-deep .video-player
      @extend %img-play-chat
      @extend %img-play
      img:not([src])
        margin: 0
        min-width: 200px
        min-height: 100px

    ::v-deep .tag-user
      color: #729fcf

    ::v-deep :visited
      color: #7572CF
    ::v-deep :link
      color: $link-color
    ::v-deep a
      &:hover
        text-decoration: underline

    ::v-deep img[alt] // smile
      @extend %img-code

    ::v-deep .quote
      border-left: 5px solid #4d4d4d
      padding-left: 5px
      margin: 5px
      span
        font-weight: bold
    ::v-deep pre
      margin: 10px
      max-width: calc(100% - 15px)
      overflow-x: auto

    ::v-deep .video-player-ready
      border: none
      @include margin-img-def
      width: 500px
      height: 350px
      @include margin-img

    ::v-deep .giphy
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

    ::v-deep .B4j2ContentEditableImg
      @include margin-img-def
      @include margin-img
      &.failed
        min-width: 200px
        min-height: 100px
        + div.icon-youtube-play
          width: 50px
          margin-right: -30px
    ::v-deep .video-record
      img
        border-radius: 50%
      div
        background-color: transparent
    ::v-deep .audio-record
      vertical-align: middle
      height: 50px
      cursor: pointer
    ::v-deep .uploading-file
      vertical-align: middle
      height: 50px
      cursor: pointer
    ::v-deep .audio-player-ready
      vertical-align: middle

  .color-lor p ::v-deep, .color-reg p ::v-deep
    @import "../../../../node_modules/highlightjs/styles/railscasts.css"
  .color-white p ::v-deep
    @import "../../../../node_modules/highlightjs/styles/default.css"
    .message-others
      background-color: white
</style>
