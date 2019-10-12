<template>
  <div :class="cls">
    <chat-message :message="message"/>
    <template v-if="message.transfer">
      <app-progress-bar v-if="message.transfer.upload  && !message.transfer.error" :upload="message.transfer.upload"/>
      <i v-else-if="message.files.length" class="icon-repeat" @click="retry">{{message.transfer.error}}</i>
      <div class="spinner"></div>
    </template>
  </div>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import ChatMessage from '@/components/chat/ChatMessage';
  import AppProgressBar from '@/components/ui/AppProgressBar';
  import {channelsHandler} from '@/utils/singletons';
  import {SetMessageProgressError} from '@/types/types';
  import {
    CurrentUserInfoModel,
    MessageModel,
    RoomDictModel
  } from "@/types/model";
  @Component({
    components: {AppProgressBar, ChatMessage}
  })
  export default class ChatSendingMessage extends Vue {
    @Prop() message: MessageModel;

    @State
    public readonly userInfo!: CurrentUserInfoModel;
    @State
    public readonly roomsDict!: RoomDictModel;

    get searchedIds() {
      return this.roomsDict[this.message.roomId].search.searchedIds;
    }

    get id() {
      return this.message.id;
    }

    get cls() {
      return {
        sendingMessage: this.message.transfer && !this.message.transfer.upload,
        uploadMessage: this.message.transfer && !!this.message.transfer.upload,
        "filter-search": this.searchedIds.indexOf(this.message.id) >= 0,
        "message-self": this.isSelf,
        "message-others": !this.isSelf,
        "removed-message": this.message.deleted,
      }
    }

    get isSelf() {
      return this.message.userId === this.userInfo.userId;
    }



    retry() {
      let newVar: SetMessageProgressError = {
        messageId: this.message.id,
        roomId: this.message.roomId,
        error: null
      };
      this.store.setMessageProgressError(newVar);
      channelsHandler.resendMessage(this.message.id);
      this.store.growlInfo("Trying to upload files again");
    }
  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"

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
  .icon-repeat
    display: block
    text-align: center
    cursor: pointer

</style>
