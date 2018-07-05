<template>
  <nav @click="toggle" :class="{expanded}">
    <router-link to="/" class="icon-home" title="Go home">
      <span class="mText">Home</span>
    </router-link>
    <router-link to="/painter" class="icon-brush" title="Draw an Image">
      <span class="mText">Painter</span>
    </router-link>
    <router-link to="/report-issue" class="icon-pencil" title="Report an issue">
      <span class="mText">Issue</span>
    </router-link>
    <i class="icon-phone" title="Make a video/mic call"><span class="mText">Call</span></i>
    <i class="icon-search" v-if="activeRoom" @click='invertSearch' title="Search messages in current room (Shift+Ctrl+F)"><span
        class="mText">Search</span></i>

    <router-link to="/statistics" class="icon-chart-pie" title="Show user countries statistics">
      <span class="mText">Statistics</span>
    </router-link>
    <i class="icon-doc-inv"><span class="mText">Send File</span></i>
    <i class="icon-popup"><span class="mText">Minimized Windows</span></i>
    <a href="https://github.com/Deathangel908/pychat" target="_blank" class="icon-github"><span
        class="mText">Github</span></a>
    <template v-if="userInfo">
      <div class="navMenu">
        <span class="onlineStatus" :title="title" :class="{online: isOnline, offline: !isOnline}">●</span>
        <span class="username"><b>{{userInfo.user}}</b></span>
        <i class="icon-menu" title="Open Menu"></i>
      </div>
      <router-link to="/profile" class="icon-wrench" title="Settings">
        <span class="mText">Profile</span>
      </router-link>
      <i title="Sign out" class="icon-sign-out" @click="signOut"><span class="mText">Sign out</span></i>
    </template>
  </nav>
</template>
<script lang="ts">
  import {Action, State, Getter, Mutation} from "vuex-class";
  import {Component, Vue} from "vue-property-decorator";
  import {RoomModel, UserModel} from "../types/model";
  import {logout} from "../utils/utils";
  import {SetSearchTo} from '../types/types';

  @Component
  export default class AppNav extends Vue {
    @State isOnline: boolean;
    @State userInfo: UserModel;
    @Getter activeRoom: RoomModel;
    @Action growlError;
    @Action logout;
    @Mutation setSearchTo;

    expanded: boolean = false;

    get title() {
      return this.isOnline ? "Websocket connection established. You are online": "Trying to connect to the server. You're offline";
    }

    invertSearch() {
      this.setSearchTo({
        roomId: this.activeRoom.id,
        search: { ...this.activeRoom.search, searchActive: !this.activeRoom.search.searchActive}
        } as SetSearchTo);
    }

    toggle() {
      this.logger.log('Toggle nav')();
      this.expanded = !this.expanded;
    }

    signOut() {
      this.$api.logout(logout);
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/variables"
  @import "partials/mixins"
  @import "partials/abstract_classes"

  .username
    font-size: 22px
    padding-right: 10px


  .expanded
    max-height: $collapse-height

  nav
    max-height: 32px
    @extend %nav
    > *
      order: 2
    .navMenu
      margin-left: auto
      .icon-menu
        display: none
    @media screen and (min-width: $collapse-width) and (max-width: $collapse-no-mtext)
      .mText
        display: none !important
    @media screen and (max-width: $collapse-width)
      flex-direction: column
      > *
        margin-right: auto !important
      .navMenu
        position: relative
        width: 100%
        margin-bottom: 10px
        order: 1
      .icon-menu
        display: inline-block
        position: absolute
        top: 0
        right: 5px

  [class^='icon-']
    cursor: pointer

  .color-lor
    .onlineStatus
      padding: 0 10px
      &.offline
        color: #b02e2e
      &.online
        color: #53a045
      [class^='icon-']:hover
        text-shadow: 0 0 0.2em #FFF, 0 0 0.2em #3D3D3D

      .icon-home
        color: rgb(51, 122, 183)
      .icon-brush
        color: #960000
      .icon-pencil
        color: rgb(85, 26, 139)
      .icon-santa-hat
        color: rgb(207, 80, 80)
      .icon-chart-pie
        color: rgb(121, 144, 15)
      .icon-sign-out
        color: $red-cancel-lor
      .icon-trash-circled
        color: #2d88c4
      .icon-wrench
        color: rgb(70, 133, 117)
      .icon-phone
        color: #136C00
      .icon-doc-inv
        color: #40b2b2
      .icon-popup
        color: #c58446
  .color-white
    .onlineStatus
      &.online
        color: green
      &.offline
        color: red

  .onlineStatus
    padding: 0 10px

  .color-reg
    .onlineStatus
      &.offline
        color: #ee2d2d
      &.online
        color: #53a045
    .icon-github
      @include hover-click(#bbbbbb)
    .icon-home
      @include hover-click(#20A0FF)
    .icon-brush
      @include hover-click(#ee0000)
    .icon-pencil
      @include hover-click(#8D28DE)
    .icon-trash-circled
      @include hover-click(#35a3e8)
    .icon-chart-pie
      @include hover-click(#B7D710)
    .icon-sign-out
      @include hover-click($red-cancel-reg)
    .icon-wrench
      @include hover-click(#67C8B0)

    .icon-phone
      @include hover-click(#37BB21) /*override .		color-lor :link*/
    .icon-doc-inv
      @include hover-click(#15dfff)
    .icon-popup
      @include hover-click(#ff9900)


</style>