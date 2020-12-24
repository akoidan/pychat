<template>
  <div class="message-tooltip">
    <i
      class="icon-pencil"
      v-if="isMine"
      @click.stop="m2EditMessage"
    />
    <i
      v-if="isMine"
      class="icon-trash-circled"
      @click.stop="m2DeleteMessage"
    />
    <i
      v-if="!message.parentMessage"
      class="icon-comment"
      @click.stop="m2Comment"
    />
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
import {State} from '@/ts/instances/storeInstance';
import {EditingMessage, MessageModel} from '@/ts/types/model';

@Component
export default class ChatMessageToolTip extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @State
  public readonly myId!: number;


  private get isMine(): boolean {
    return this.message.userId === this.myId;
  }

  public m2DeleteMessage() {
    let payload: EditingMessage = {
      messageId: this.message.id,
      roomId: this.message.roomId,
      isEditingNow: false,
    }
    this.$messageBus.$emit('delete-message', payload);
  }

  public m2Comment() {
    this.$store.setCurrentThread({messageId: this.message.id, roomId: this.message.roomId});
  }

  public m2EditMessage() {
    let payload: EditingMessage = {
      messageId: this.message.id,
      roomId: this.message.roomId,
      isEditingNow: true,
    };
    this.$store.setEditedMessage(payload);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins"

  .message-tooltip > *
    cursor: pointer
  .icon-trash-circled
    @include hover-click(red)

  .icon-pencil
    @include hover-click(#396eff)

  .icon-comment
    @include hover-click(#23ff00)

</style>
