<template>
  <div :class="{sendingMessage: !message.upload, uploadMessage: !!message.upload}">
    <chat-message  :message="message" :searched="[]"/>
    <app-progress-bar v-if="message.upload" :upload="message.upload"/>
    <div v-else class="spinner">
    </div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {SentMessageModel} from '../../types/model';
  import ChatMessage from './ChatMessage';
  import AppProgressBar from '../ui/AppProgressBar';
  @Component({
    components: {AppProgressBar, ChatMessage}
  })
  export default class ChatSendingMessage extends Vue {
    @Prop() message: SentMessageModel;
  }
</script>

<style lang="sass" scoped>

  @import "partials/mixins"

  .sendingMessage
    position: relative
    > p
      padding-right: 30px

  .spinner
    position: absolute
    right: 0
    top: 3px
    display: inline-block
    margin: -4px 10px -4px 10px
    @include spinner(3px, white)
</style>