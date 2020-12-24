<template>
  <div>
    <chat-sending-message :message="message"/>
    <div v-if="!isActive" @click="activate" class="thread-replies-count">{{messages.length}} replies</div>
    <div v-show="isActive" class="thread-opened">
      <chat-sending-message
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
import {EditingThread, MessageModel} from '@/ts/types/model';
import ChatSendingMessage from '@/vue/chat/ChatSendingMessage.vue';
import {State} from '@/ts/instances/storeInstance';
@Component({
  components: {ChatSendingMessage}
})
export default class ChatThread extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @Prop()
  public readonly messages!: MessageModel[];

  @State
  public readonly editingThread!: EditingThread;

  get isActive() {
    return this.editingThread && this.editingThread.messageId === this.message.id;
  }

  activate() {
    this.$store.setCurrentThread({messageId: this.message.id, roomId: this.message.roomId});
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
