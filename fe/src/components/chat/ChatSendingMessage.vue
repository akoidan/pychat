<template>
  <div :class="{sendingMessage: !message.upload, uploadMessage: !!message.upload}">
    <chat-message  :message="message" :searched="[]"/>
    <app-progress-bar v-if="message.upload" @retry="retry" :upload="message.upload"/>
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
  import {channelsHandler} from '../../utils/singletons';
  import {SetMessageProgressError} from '../../types/types';
  @Component({
    components: {AppProgressBar, ChatMessage}
  })
  export default class ChatSendingMessage extends Vue {
    @Prop() message: SentMessageModel;
    @Mutation setMessageProgressError;
    @Action growlInfo;

    retry() {
      let newVar: SetMessageProgressError = {
        messageId: this.message.id,
        roomId: this.message.roomId,
        error: null
      };
      this.setMessageProgressError(newVar);
      channelsHandler.resendFiles(this.message.id);
      this.growlInfo("Trying to upload files again");
    }
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