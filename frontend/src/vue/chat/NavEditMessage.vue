<template>
  <nav v-if="editedMessage">
    <i
      v-if="!editedMessage.isEditingNow"
      class="icon-pencil"
      @click.stop="m2EditMessage"
    ><span
      class="mText"
    >Edit</span></i>
    <i
      v-if="!editedMessage.isEditingNow"
      class="icon-trash-circled"
      @click.stop="m2DeleteMessage"
    ><span
      class="mText"
    >Delete</span></i>
    <i
      class="icon-cancel"
      @click.stop="m2Close"
    ><span class="mText">Close</span></i>
  </nav>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Vue
} from 'vue-property-decorator';
import { EditingMessage } from '@/ts/types/model';


@Component
export default class NavEditMessage extends Vue {

  @State
  public readonly editedMessage!: EditingMessage;


  public m2DeleteMessage() {
    let payload: EditingMessage = {
      messageId: this.editedMessage.messageId,
      roomId: this.editedMessage.roomId,
      isEditingNow: false
    };
    this.$messageBus.$emit('delete-message', payload);
  }

  public m2EditMessage() {
    let payload: EditingMessage = {
      messageId: this.editedMessage.messageId,
      roomId: this.editedMessage.roomId,
      isEditingNow: true
    };
    this.$store.setEditedMessage(payload);
  }

  public m2Close() {
    this.$store.setEditedMessage(null);
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"
  nav
    @extend %nav
    > *
      cursor: pointer

  i
    margin: 0 0.2em

  .icon-cancel
    margin-left: auto

  @media screen and (max-width: $collapse-width)
    .icon-cancel
      margin: 0

  .color-reg
    .icon-pencil
      @include hover-click(#8D28DE)
    .icon-trash-circled
      @include hover-click(#7aa5e1)
    .icon-cancel
      @include hover-click($red-cancel-reg)
  .color-lor
    .icon-pencil
      color: rgb(85, 26, 139)
    .icon-trash-circled
      color: #5a82b3
    .icon-cancel
      color: $red-cancel-lor

</style>
