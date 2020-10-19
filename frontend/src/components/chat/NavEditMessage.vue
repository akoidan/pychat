<template>
  <nav>
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
import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {EditingMessage} from '@/types/model';
import {channelsHandler} from '@/utils/singletons';

@Component
export default class NavEditMessage extends Vue {
  @Prop() public editedMessage! : EditingMessage;

  public m2DeleteMessage() {
    this.$emit('delete-message');
  }

  public m2EditMessage() {
    this.$emit('edit-message');
  }

  public m2Close() {
    this.$emit('close');
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"
  nav
    @extend %nav
    > *
      cursor: pointer

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
