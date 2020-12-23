<template>
  <div class="message-tooltip">
    <i
      class="icon-pencil"
      @click.stop="m2EditMessage"
    />
    <i
      class="icon-trash-circled"
      @click.stop="m2DeleteMessage"
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

  public m2DeleteMessage() {
    let payload: EditingMessage = {
      messageId: this.message.id,
      roomId: this.message.roomId,
      isEditingNow: false,
    }
    this.$messageBus.$emit('delete-message', payload);
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

</style>
