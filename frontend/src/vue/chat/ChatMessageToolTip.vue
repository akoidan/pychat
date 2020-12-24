<template>
  <div class="message-tooltip">
    <i
      v-if="isMine && message.content"
      class="icon-pencil"
      @click.stop="editMessage"
    />
    <i
      v-if="isMine && message.content"
      class="icon-trash-circled"
      @click.stop="deleteMessage"
    />
    <i
      v-if="!message.parentMessage"
      class="icon-comment"
      @click.stop="toggleThread"
    />
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch, Ref, Emit} from 'vue-property-decorator';
import {State} from '@/ts/instances/storeInstance';
import {EditingMessage, MessageModel} from '@/ts/types/model';
import {editMessageWs} from '@/ts/utils/pureFunctions';

@Component
export default class ChatMessageToolTip extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @State
  public readonly myId!: number;


  private get isMine(): boolean {
    return this.message.userId === this.myId;
  }

  @Emit()
  editMessage() {}

  public deleteMessage() {
    editMessageWs(
        null,
        this.message.id,
        this.message.roomId,
        null,
        null,
        this.message.time,
        this.message.edited ? this.message.edited + 1 : 1,
        this.message.parentMessage,
        this.$store,
        this.$messageSenderProxy.getMessageSender(this.message.roomId)
    );
  }

  public toggleThread() {
    this.$store.setCurrentThread({messageId: this.message.id, roomId: this.message.roomId, isEditingNow: !this.message.isThreadOpened});
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
