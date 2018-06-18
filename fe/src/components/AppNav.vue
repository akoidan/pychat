<template>
  <nav class="noSelection" :class="{expanded}" @click="toggle">
    <router-link to="/" class="icon-home" title="Go home"><span class="mText">Home</span></router-link>
    <i class="icon-brush" title="Draw an Image">
      <span class="mText">Painter</span>
    </i>
    <router-link to="/report-issue" class="icon-pencil" title="Report an issue"><span class="mText">Issue</span></router-link>
    <i class="icon-phone" title="Make a video/mic call"><span class="mText">Call</span></i>
    <i class="icon-search" title="Search messages in current room (Shift+Ctrl+F)"><span class="mText">Search</span></i>

    <router-link to="/statistics" class="icon-chart-pie" title="Show user countries statistics"><span class="mText">Statistics</span></router-link>
    <i class="icon-doc-inv"><span class="mText">Send File</span></i>
    <i class="icon-popup"><span class="mText">Minimized Windows</span></i>
    <a href="https://github.com/Deathangel908/pychat" target="_blank" class="icon-github"><span class="mText">Github</span></a>
    <div class="navMenu">
      <span class="onlineStatus" :title="title" :class="{online: isOnline, offline: !isOnline}">●</span>
      <span class="username"><b>{{userInfo.user}}</b></span>
      <i class="icon-menu" title="Open Menu"></i>
    </div>
    <router-link to="/profile" class="icon-wrench" title="Settings"><span class="mText">Profile</span></router-link>
    <i title="Sign out" class="icon-sign-out"><span class="mText">Sign out</span></i>
  </nav>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    @State isOnline;
    @State userInfo;
    expanded: boolean = false;

    get title() {
      return this.isOnline ? "Websocket connection established. You are online": "Trying to connect to the server. You're offline";
    }

    toggle() {
      this.expanded = !this.expanded;
    }
  }
</script>

<style lang="sass" scoped>

  @import "../assets/sass/partials/variables"
  @import "../assets/sass/partials/mixins"

  .username
    font-size: 22px
    padding-right: 10px

  nav
    font-size: 26px
    margin: 0
    padding: 10px 4px 9px 10px
    @include display-flex
    align-items: center
    display: flex
    position: relative
    flex-direction: row
    overflow: hidden
    max-height: 30px
    transition: max-height 0.4s ease-out
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
      &.expanded
        max-height: $collapse-height

  [class^='icon-']
    cursor: pointer

  .color-lor
    nav
      background-color: $color-lor-nav-color
      background-image: linear-gradient(#232323 0%, #151515 100%)
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
        color: rgb(169, 68, 66)
      .icon-wrench
        color: rgb(70, 133, 117)
      .icon-phone
        color: #136C00
      .icon-doc-inv
        color: #40b2b2
      .icon-popup
        color: #c58446
  .color-white
    nav
      background-color: #333
      border-color: #080808
      color: $color-white-main
    .onlineStatus
      &.online
        color: green
      &.offline
        color: red

  .onlineStatus
    padding: 0 10px

  .color-reg
    nav
      background-image: linear-gradient(#232323 0%, #151515 100%)
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
    .icon-chart-pie
      @include hover-click(#B7D710)
    .icon-sign-out
      @include hover-click(#F5504C)
    .icon-wrench
      @include hover-click(#67C8B0)

    .icon-phone
      @include hover-click(#37BB21) /*override .		color-lor :link*/
    .icon-doc-inv
      @include hover-click(#15dfff)
    .icon-popup
      @include hover-click(#ff9900)


</style>