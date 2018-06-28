<template>
  <nav>
    <i class="icon-pencil" v-if="!editedMessage.isEditingNow" @click.stop="m2EditMessage"><span
        class="mText">Edit</span></i>
    <i class="icon-trash-circled" v-if="!editedMessage.isEditingNow" @click.stop="m2DeleteMessage"><span
        class="mText">Delete</span></i>
    <i class="icon-cancel" @click.stop="m2Close"><span class="mText">Close</span></i>
  </nav>
</template>
<script lang="ts">

  import {Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {EditingMessage} from "../../types/model";
  import {channelsHandler} from '../../utils/singletons';


  @Component
  export default class NavEditMessage extends Vue {
    @Prop() editedMessage : EditingMessage;
    @Mutation setEditedMessage: SingleParamCB<EditingMessage>;


    m2DeleteMessage() {
      channelsHandler.sendDeleteMessage(this.editedMessage.messageId, this.editedMessage.originId);
      this.setEditedMessage(null);
    }

    m2EditMessage() {
      this.setEditedMessage({...this.editedMessage, isEditingNow: true});
    }

    m2Close() {
      this.setEditedMessage(null);
    }
  }
</script>

<style lang="sass" scoped>
  @import "partials/abstract_classes"
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