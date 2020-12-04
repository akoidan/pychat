<template>
  <nav
    :class="{expanded}"
    @click="toggle"
  >
    <router-link
      to="/"
      class="icon-home"
      title="Go home"
    >
      <span class="mText">Home</span>
    </router-link>
    <router-link
      v-if="consts.ISSUES"
      to="/report-issue"
      class="icon-pencil"
      title="Report an issue"
    >
      <span class="mText">Issue</span>
    </router-link>
    <router-link
      v-if="consts.STATISTICS"
      to="/statistics"
      class="icon-chart-pie"
      title="Statistics"
    >
      <span class="mText">Statistics</span>
    </router-link>
    <i
      v-if="showCallIcon"
      class="icon-phone"
      title="Make a video/mic call"
      @click="toggleContainer(activeRoom.id)"
    ><span class="mText">Call</span></i>
    <i
      v-if="showSearchIcon"
      class="icon-search"
      title="Search messages in current room (Shift+Ctrl+F)"
      @click="invertSearch"
    ><span
      class="mText"
    >Search</span>
    </i>
    <i
      v-if="false"
      class="icon-popup"
    ><span class="mText">Minimized Windows</span></i>
    <a
      v-if="consts.GITHUB_LINK"
      :href="consts.GITHUB_LINK"
      target="_blank"
      class="icon-github"
    ><span
      class="mText"
    >Github</span></a>
    <template v-if="userInfo">
      <div class="navMenu">
        <span
          class="onlineStatus"
          :title="title"
          :class="{online: isOnline, offline: !isOnline}"
        >●</span>
        <span class="username"><b>{{ userInfo.user }}</b></span>
        <i
          class="icon-menu"
          title="Open Menu"
        />
      </div>
      <router-link
        to="/profile"
        class="icon-wrench"
        title="Settings"
      >
        <span class="mText">Profile</span>
      </router-link>
      <i
        title="Sign out"
        class="icon-sign-out"
        @click="signOut"
      ><span class="mText">Sign out</span></i>
    </template>
  </nav>
</template>
<script lang="ts">
import {State} from '@/ts/instances/storeInstance';
import {Component, Vue, Ref} from 'vue-property-decorator';
import {CurrentUserInfoModel, RoomModel, UserModel} from '@/ts/types/model';
import {ISSUES, GITHUB_LINK, STATISTICS} from '@/ts/utils/consts';
import {sub} from '@/ts/instances/subInstance'
import { LogoutMessage } from '@/ts/types/messages/innerMessages';

@Component
export default class AppNav extends Vue {

  get title() {
    return this.isOnline ? 'Websocket connection established. You are online' : 'Trying to connect to the server. You\'re offline';
  }
  @State
  public readonly activeRoom!: RoomModel;

  @State
  public readonly activeRoomOnline!: string[];

  @State
  public readonly isOnline!: boolean;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public get consts(): object {
    return {
      GITHUB_LINK,
      ISSUES,
      STATISTICS
    }
  }

  private get showCallIcon() {
    let callShouldShown = this.activeRoomOnline.length > 1 || this.activeRoom?.callInfo?.callActive;
    return this.$route.name === 'chat' && callShouldShown;
  }

  private get showSearchIcon() {
   return this.activeRoom && this.$route.name === 'chat' && !this.activeRoom.p2p;
  }

  public expanded: boolean = false;

  public toggleContainer(roomd: number) {
    this.$store.toggleContainer(roomd);
  }

  public invertSearch() {
    this.$store.toogleSearch({
      roomId: this.activeRoom.id
    });
  }

  public toggle() {
    this.$logger.log('Toggle nav')();
    this.expanded = !this.expanded;
  }

  public async signOut() {
    this.$api.logout(); // do not make user wait, logout instantly
    let message: LogoutMessage = {
      action: 'logout',
      handler: 'any'
    };
    sub.notify(message);
  }
}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"

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
    margin: 0 0.2em

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

  .color-white
    .icon-home
      color: #20A0FF
    .icon-pencil
      color: #ae49ff
    .icon-chart-pie
      color: #8a9c2c
    .icon-sign-out
      color: #F5504C
    .icon-wrench
      color: #67C8B0
    .icon-phone
      color: #257517 /*override .		color-lor :link*/
    .icon-popup
      color: #ff9900
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
    .icon-popup
      @include hover-click(#ff9900)


</style>
