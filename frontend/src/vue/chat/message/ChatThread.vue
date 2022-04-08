<template>
  <div>
    <chat-sending-message :message="message"/>
    <div v-if="!message.isThreadOpened" class="thread-replies-count" @click="activate">
      {{ message.threadMessagesCount }} replies
    </div>
    <div v-if="locked" class="loading-history">
      <div class="spinner"/>
      <div>Loading history...</div>
    </div>
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
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {MessageModel} from "@/ts/types/model";
import ChatSendingMessage from "@/vue/chat/message/ChatSendingMessage.vue";
import ChatTextArea from "@/vue/chat/textarea/ChatTextArea.vue";
import ChatSendingFile from "@/vue/chat/message/ChatSendingFile.vue";
import ChatReceivingFile from "@/vue/chat/message/ChatReceivingFile.vue";
import AppSeparator from "@/vue/ui/AppSeparator.vue";

@Component({
  name: "ChatThread",
  components: {
    AppSeparator,
    ChatReceivingFile,
    ChatSendingFile,
    ChatTextArea,
    ChatSendingMessage,
  },
})
export default class ChatThread extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @Prop() // (MessageModel|ReceivingFile|SendingFile)[];
  public readonly messages!: any[];

  public locked: boolean = false;

  @Ref()
  private readonly textarea!: ChatTextArea;

  @Watch("message.threadMessagesCount")
  checkThreadMessagesCountMatch() {
    // During printing message there's time when old message exists with a new one
    if (this.message.threadMessagesCount !== this.messages.length ?? this.message.threadMessagesCount + 1 !== this.messages.length) {
      this.$logger.warn(`Message #${this.message.id} has mismatched thread messages count ${this.message.threadMessagesCount}!=${this.messages.length}`)();
    }
  }

  @Watch("message.isThreadOpened")
  async onThreadOpen(value: boolean) {
    if (value) {
      if (this.message.threadMessagesCount > this.messages.length) {
        if (this.locked) {
          this.$logger.warn("Messages are locked, so syncing won't be triggered")();
          return;
        }
        try {
          this.locked = true;
          await this.$messageSenderProxy.getMessageSender(this.message.roomId).loadThreadMessages(this.message.roomId, this.message.id);
        } finally {
          this.locked = false;
        }
      }
      this.$nextTick(() => {
        this.textarea.userMessage.focus();
      });
    }
  }

  mounted() {
    this.textarea.userMessage.focus();
  }

  activate() {
    this.$store.setCurrentThread({
      messageId: this.message.id,
      roomId: this.message.roomId,
      isEditingNow: true,
    });
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/mixins"

.loading-history
  display: flex
  padding: 2px 14px
  justify-content: center

.spinner
  margin-right: 10px
  @include spinner(3px, white)

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
