<template>
  <div :class="cls" @mouseover.passive="removeUnread">
    <div v-if="message.isEditingActive" class="editing-background"></div>
    <div v-if="message.isThreadOpened" class="thread-background" @click="closeThread"></div>
    <chat-message :message="message" @quote="quote"/>
    <chat-text-area
      v-if="message.isEditingActive"
      :ref="textarea"
      :room-id="message.roomId"
      :edit-message-id="message.id"
    />
    <template v-if="message.transfer">
      <div class="transfer-file" v-if="message.transfer.upload && !message.transfer.error">
        <app-progress-bar :upload="message.transfer.upload"/>
        <i class="icon-cancel-circled-outline" @click="cancelTransfer"/>
      </div>
      <i
        v-else-if="filesExist"
        class="icon-repeat"
        @click="retry"
      >{{ message.transfer.error }}</i>
    </template>
    <div class="absolute-right">
      <chat-message-tool-tip
        class="message-tooltip"
        :message="message"
      />
      <i class="icon-ok message-status-read" v-if="isSelf && message.status === 'read'" title="This message has been read by at least one user"/>
      <i class="icon-ok message-status-received" v-if="isSelf && message.status === 'received'" title="At least one user in this room has received this message"/>
      <div class="spinner" v-if="message.status === 'sending'" />
    </div>
  </div>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Ref,
  Prop,
  Emit,
  Vue
} from 'vue-property-decorator';
import ChatMessage from '@/vue/chat/ChatMessage.vue';
import AppProgressBar from '@/vue/ui/AppProgressBar.vue';

import { SetMessageProgressError } from '@/ts/types/types';
import {
  CurrentUserInfoModel,
  EditingMessage,
  MessageModel,
  RoomDictModel
} from '@/ts/types/model';
import ChatMessageToolTip from '@/vue/chat/ChatMessageToolTip.vue';
import ChatTextArea from '@/vue/chat/ChatTextArea.vue';

@Component({
  components: {ChatTextArea, ChatMessageToolTip, AppProgressBar, ChatMessage}
})
export default class ChatSendingMessage extends Vue {
  @Prop() public message!: MessageModel;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @Ref()
  private readonly textarea!: ChatTextArea;

  @State
  public readonly roomsDict!: RoomDictModel;


  get filesExist() {
    return this.message.files && Object.keys(this.message.files).length > 0;
  }

  get id() {
    return this.message.id;
  }

  cancelTransfer() {
    this.message.transfer?.xhr?.abort();
  }

  get cls() {
    return {
      sendingMessage: this.message.transfer && !this.message.transfer.upload,
      uploadMessage: this.message.transfer && !!this.message.transfer.upload,
      'message-self': this.isSelf,
      'message-others': !this.isSelf,
      'message-wrapper': true,
      'message-is-being-sent': this.message.status === 'sending',
      'removed-message': this.message.deleted,
      'unread-message': this.message.isHighlighted,
    };
  }

  get isSelf() {
    return this.message.userId === this.userInfo.userId;
  }

  @Emit()
  quote() {
    return this.message;
  }

  closeThread() {
    let a: EditingMessage = {
      messageId: this.message.id,
      isEditingNow: false,
      roomId: this.message.roomId
    }
    this.$store.setCurrentThread(a);
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


  .icon-cancel-circled-outline
    cursor: pointer
    margin-left: 20px
    @include hover-click(red)

  %message-status
    margin: 0 8px
    font-size: 10px
  .message-status-read
    @extend %message-status
    color: #00b500
  .message-status-received
    @extend %message-status
    color: #dfdd00
  .editing-background
    border: 1px solid $editing-border-color
    background-color: rgba(255, 255, 255, 0.11)
  .thread-background
    cursor: pointer
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
      %message-status, .spinner
        display: none

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
  .transfer-file
    display: flex
    justify-content: center
</style>
