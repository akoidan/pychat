<template>
  <div :class="{'message-tooltip-opened': message.isEditingActive}" class="message-tooltip">
    <i
      v-if="message.isEditingActive"
      class="icon-cancel-circled-outline"
      @click.stop="setEditingMode(false)"
    />
    <template v-else>
      <i
        v-if="isMine && message.content && showAllowEditing()"
        class="icon-pencil"
        @click.stop="setEditingMode(true)"
      />
      <i
        v-if="isMine && message.content && showAllowEditing()"
        class="icon-trash-circled"
        @click.stop="deleteMessage"
      />
      <i
        v-if="!message.parentMessage"
        class="icon-comment"
        @click.stop="toggleThread"
      />
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";
import type {EditingMessage} from "@/ts/types/model";
import {MessageModel} from "@/ts/types/model";
import {
  editMessageWs,
  showAllowEditing
} from "@/ts/utils/pureFunctions";

@Component({name: "ChatMessageToolTip"})
export default class ChatMessageToolTip extends Vue {
  @Prop()
  public readonly message!: MessageModel;

  @State
  public readonly myId!: number;


  public get isMine(): boolean {
    return this.message.userId === this.myId;
  }

  showAllowEditing() {
    return showAllowEditing(this.message);
  }

  setEditingMode(isEditingNow: boolean) {
    if (!this.showAllowEditing()) {
      this.$store.growlError("You can't edit messages sent more than 1 day ago");
    }
    const a: EditingMessage = {
      messageId: this.message.id,
      isEditingNow,
      roomId: this.message.roomId,
    };
    this.$store.setEditedMessage(a);
  }

  public deleteMessage() {
    if (!this.showAllowEditing()) {
      this.$store.growlError("You can't delete messages sent more than 1 day ago");
      return;
    }
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }
    // TODO, check if opened is the only status with abor request
    if (this.message?.transfer?.xhr?.readyState === XMLHttpRequest.OPENED) {
      this.message.transfer.xhr.abort();
    }
    editMessageWs(
      null,
      this.message.id,
      this.message.roomId,
      null,
      null,
      {},
      this.message.time,
      Date.now(),
      this.message.parentMessage,
      this.$store,
      this.$messageSenderProxy.getMessageSender(this.message.roomId),
    );
  }

  public toggleThread() {
    this.$store.setCurrentThread({
      messageId: this.message.id,
      roomId: this.message.roomId,
      isEditingNow: !this.message.isThreadOpened
    });
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
@import "@/assets/sass/partials/mixins"

.icon-cancel-circled-outline
  @include hover-click(#ee0000)

.message-tooltip-opened
  display: block !important

.color-reg .message-tooltip
  background: #3e3e3f

.message-tooltip
  padding: 6px
  margin: 0

  > *
    cursor: pointer

.icon-trash-circled
  @include hover-click(red)

.icon-pencil
  @include hover-click(#396eff)

.icon-comment
  @include hover-click(#23ff00)

</style>
