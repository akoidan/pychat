<template>
  <div :class="cls" @mouseover.passive="removeUnread" @contextmenu="contextmenu">
    <div v-if="isEditing" class="editing-background"></div>
    <div v-if="isCurrentThreadEditing" class="thread-background"></div>
    <chat-message :message="message" class="message-content" />
    <template v-if="message.transfer">
      <app-progress-bar
        v-if="message.transfer.upload && !message.transfer.error"
        :upload="message.transfer.upload"
      />
      <i
        v-else-if="filesExist"
        class="icon-repeat"
        @click="retry"
      >{{ message.transfer.error }}</i>
    </template>
    <div class="absolute-right">
      <!--      IF message doesnt have content it's deleted-->
      <chat-message-tool-tip class="message-tooltip" :message="message" v-if="message.content"/>
      <div class="spinner" v-if="message.sending" />
    </div>
  </div>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import ChatMessage from '@/vue/chat/ChatMessage.vue';
import AppProgressBar from '@/vue/ui/AppProgressBar.vue';

import { SetMessageProgressError } from '@/ts/types/types';
import {
  CurrentUserInfoModel, EditingMessage, EditingThread,
  MessageModel,
  RoomDictModel
} from '@/ts/types/model';
import ChatMessageToolTip from '@/vue/chat/ChatMessageToolTip.vue';
import {isMobile} from '@/ts/utils/runtimeConsts';
import {sem} from '@/ts/utils/pureFunctions';

@Component({
  components: {ChatMessageToolTip, AppProgressBar, ChatMessage}
})
export default class ChatSendingMessage extends Vue {
  @Prop() public message!: MessageModel;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly editedMessage!: EditingMessage;

  @State
  public readonly editingThread!: EditingThread;


  @State
  public readonly roomsDict!: RoomDictModel;



  get filesExist() {
    return this.message.files && Object.keys(this.message.files).length > 0;
  }

  get id() {
    return this.message.id;
  }
  get isCurrentThreadEditing() {
    return this.editingThread && this.editingThread.messageId === this.message.id;
  }

  get isEditing() {
    return this.editedMessage && this.editedMessage.messageId === this.message.id;
  }

  get cls() {
    return {
      sendingMessage: this.message.transfer && !this.message.transfer.upload,
      uploadMessage: this.message.transfer && !!this.message.transfer.upload,
      'message-self': this.isSelf,
      'message-others': !this.isSelf,
      'message-wrapper': true,
      'message-is-being-sent': this.message.sending,
      'removed-message': this.message.deleted,
      'unread-message': this.message.isHighlighted,
    };
  }

  get isSelf() {
    return this.message.userId === this.userInfo.userId;
  }

   contextmenu(event: Event) {
    if (isMobile) {
      event.preventDefault();
      event.stopPropagation();
      sem(event, this.message, false, this.userInfo, this.$store.setEditedMessage);
    }
  }

  removeUnread() {
    if (this.message.isHighlighted) {
      this.$store.markMessageAsRead({messageId: this.message.id, roomId: this.message.roomId})
    }
  }

  public retry() {
    const newVar: SetMessageProgressError = {
      messageId: this.message.id,
      roomId: this.message.roomId,
      error: null
    };
    this.$store.setMessageProgressError(newVar);
    this.$messageSenderProxy.getMessageSender(this.message.roomId).syncMessage(this.message.roomId, this.id);
    this.$store.growlInfo('Trying to upload files again');
  }
}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"

  .editing-background
    border: 1px solid $editing-border-color
    background-color: rgba(255, 255, 255, 0.11)
  .thread-background
    border: 1px solid $thread-border-color
  .editing-background, .thread-background
    position: absolute
    top: 0 //-$space-between-messages/2
    right: 0
    left: 0
    bottom: 0 //-$space-between-messages/2
  .color-white
    .editing-background
      border: 1px solid #3f3f3f
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5), 0 3px 10px 0 rgba(0,0,0,0.5)
  .message-tooltip
    display: none
    margin-right: 5px
    margin-top: $space-between-messages/2
  .absolute-right
    position: absolute
    right: 0
    top: 0
  .spinner
    display: inline-block
    margin: -4px 8px
    @include spinner(3px, white)

  .message-wrapper
    position: relative
    &:hover
      background-color: rgba(255, 255, 255, 0.11)
      .absolute-right
        top: 0 // $space-between-messages/2
      .message-tooltip
        display: inline-block
      //.message-content
      //  margin-top: 0 //-$space-between-messages/2
      //  padding-top: 0 // $space-between-messages/2
      //  padding-bottom: 0 //$space-between-messages/2
      //  margin-bottom: 0 //-$space-between-messages/2

  .sendingMessage
    position: relative
    > p
      padding-right: 30px

  .unread-message:before
    content: ""
    background-color: #444444 !important
    border-radius: 5px
    position: absolute
    width: 100%
    height: 100%
    z-index: -1
    padding: 4px 0

  .icon-repeat
    display: block
    text-align: center
    cursor: pointer

</style>
