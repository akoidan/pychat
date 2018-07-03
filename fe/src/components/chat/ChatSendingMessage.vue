<template>
  <div :class="cls" class="msgHolder">
    <chat-message :message="message"/>
    <app-progress-bar v-if="message.upload" @retry="retry" :upload="message.upload"/>
    <div v-else-if="message.sending" class="spinner">
    </div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import ChatMessage from './ChatMessage';
  import AppProgressBar from '../ui/AppProgressBar';
  import {channelsHandler} from '../../utils/singletons';
  import {SetMessageProgressError} from '../../types/types';
  import {MessageModel} from "../../types/model";
  @Component({
    components: {AppProgressBar, ChatMessage}
  })
  export default class ChatSendingMessage extends Vue {
    @Prop() message: MessageModel;
    @Mutation setMessageProgressError;
    @Action growlInfo;
    @State roomsDict;

    get searchedIds() {
      return this.roomsDict[this.message.roomId].search.searchedIds;
    }

    get id() {
      return this.message.id;
    }

    get cls() {
      return {
        sendingMessage: this.message.sending && !this.message.upload,
        uploadMessage: this.message.sending && !!this.message.upload,
        "filter-search": this.searchedIds.indexOf(this.message.id) >= 0,
      }
    }

    retry() {
      let newVar: SetMessageProgressError = {
        messageId: this.message.id,
        roomId: this.message.roomId,
        error: null
      };
      this.setMessageProgressError(newVar);
      channelsHandler.resendMessage(this.message.id);
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

  .msgHolder
    position: relative

  .spinner
    position: absolute
    right: 0
    top: 3px
    display: inline-block
    margin: -4px 10px -4px 10px
    @include spinner(3px, white)
</style>