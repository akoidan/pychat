<template>
  <div>
    <chat-sending-message :message="message"/>
    <div v-if="!message.isThreadOpened" @click="activate" class="thread-replies-count">{{messages.length}} replies</div>
    <div v-show="message.isThreadOpened" class="thread-opened">
      <template v-for="message in messages">
        <chat-sending-file
          v-if="message.transfers"
          :key="message.id"
          :sending-file="message"
        />
        <chat-receiving-file
          v-else-if="message.connId"
          :key="message.id"
          :receiving-file="message"
        />
        <chat-sending-message
          v-else
          :key="message.id"
          :message="message"
          @quote="onqoute"
        />
      </template>
      <chat-text-area
        ref="textarea"
        :room-id="message.roomId"
        :thread-message-id="message.id"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
import {MessageModel, ReceivingFile, SendingFile} from '@/ts/types/model';
import ChatSendingMessage from '@/vue/chat/ChatSendingMessage.vue';
import {State} from '@/ts/instances/storeInstance';
import ChatTextArea from '@/vue/chat/ChatTextArea.vue';
import ChatSendingFile from '@/vue/chat/ChatSendingFile.vue';
import ChatReceivingFile from '@/vue/chat/ChatReceivingFile.vue';
import AppSeparator from '@/vue/ui/AppSeparator.vue';
@Component({
  components: {
    AppSeparator,
    ChatReceivingFile,
    ChatSendingFile, ChatTextArea, ChatSendingMessage}
})
export default class ChatThread extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @Prop()
  public readonly messages!: (MessageModel|ReceivingFile|SendingFile)[];

  @Ref()
  private readonly textarea!: ChatTextArea;

  onqoute() {
    this.textarea.onEmitQuote(this.message);
  }

  @Watch('isThreadOpened')
  onThreadOpen(value: boolean) {
    if (value) {
      this.$nextTick(() => {
        this.textarea.userMessage.focus();
      })
    }
  }

  mounted() {
    this.textarea.userMessage.focus();
  }

  activate() {
    this.$store.setCurrentThread({messageId: this.message.id, roomId: this.message.roomId, isEditingNow: true});
  }

}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"

  .thread-replies-count
    margin-left: 15px
    cursor: pointer
    padding-left: 10px
    color: darken($thread-border-color, 10%)
    border-left: 4px solid darken($thread-border-color, 10%)
    &:hover
      color: $thread-border-color
      border-left: 4px solid $thread-border-color
  .thread-opened
    padding-left: 10px
    border-left: 4px solid $thread-border-color
    margin-left: 15px
</style>
