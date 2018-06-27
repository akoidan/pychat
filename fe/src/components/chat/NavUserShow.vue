<template>
  <nav>
    <i class="icon-user" onclick="channelsHandler.viewProfile()"> <span
        class="activeUserName">{{activeUser.user}}</span><span class="mText">Profile</span></i>
    <i class="icon-quote-left" onclick="channelsHandler.m2QuoteMessage(event)"><span class="mText">Quote</span> </i>
    <i class="icon-comment" onclick="channelsHandler.createDirectChannel()"><span class="mText">Write message</span></i>
    <i class="icon-phone-circled" onclick="channelsHandler.m2Call()"><span class="mText">Call</span></i>
    <i class="icon-doc-inv" onclick="channelsHandler.m2TransferFile()"><span class="mText">Transfer file</span></i>
    <i class="icon-cancel" @click.stop="closeActiveUser"><span class="mText">Close</span></i>
  </nav>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {UserModel} from "../../types/model";

  @Component
  export default class NavUserShow extends Vue {
    @Mutation setActiveUserId: SingleParamCB<number>;
    @Prop() activeUser: UserModel;

    closeActiveUser() {
      this.setActiveUserId(null);
    }

    updated() {
      this.logger.debug('updated')();
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"
  @import "partials/mixins"

  .activeUserName
    font-weight: bold

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
    .icon-cancel
      @include hover-click($red-cancel-reg)
    .icon-phone-circled
      @include hover-click(#33b334)
    .icon-doc-inv
      @include hover-click(#15dfff)
    .icon-comment
      @include hover-click(#8D28DE)
    .icon-quote-left
      @include hover-click(#67C8B0)
    .icon-user
      @include hover-click(#B7D710)
  .color-lor
    .icon-comment
      color: rgb(85, 26, 139)
    .icon-doc-inv
      color: #40b2b2
    .icon-user
      color: rgb(70, 133, 117)
    .icon-quote-left
      color: #c58446
    .icon-phone-circled
      color: #509750
    .icon-cancel
      color: $red-cancel-lor


</style>