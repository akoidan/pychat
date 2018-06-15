<template>
  <div :class="theme" class="holder">
    <div class="growlHolder">
      <growl v-for="growl in growls" :growl="growl" :key="growl.id"></growl>
    </div>
    <nav class="noSelection" v-if="userInfo">
      <router-link to="/" class="icon-home" title="Go home"><span class="mText">Home</span></router-link>
      <i class="icon-brush" title="Draw an Image">
        <span class="mText">Painter</span>
      </i>
      <router-link to="/report-issue" class="icon-pencil" title="Report an issue"><span class="mText">Issue</span></router-link>
      <i class="icon-phone" title="Make a video/mic call"><span class="mText">Call</span></i>
      <i class="icon-search" title="Search messages in current room (Shift+Ctrl+F)"><span class="mText">Search</span></i>

      <router-link to="/statistics" class="icon-chart-pie" title="Show user countries statistics"><span class="mText">Statistics</span></router-link>
      <i class="icon-doc-inv"><span class="mText">Send File</span></i>
      <i class="icon-popup hidden"><span class="mText">Minimized Winows</span></i>
      <a href="https://github.com/Deathangel908/pychat" target="_blank" class="icon-github"><span class="mText">Github</span></a>
      <div id="navMenu">
        <span id="onlineStatus" title="Websocket connection established. You are online" class=" online">●</span>
        <span id="headerText" class="username"><b>AAdmin</b></span>
        <i class="icon-menu" title="Open Menu"></i>
      </div>
      <router-link to="/profile" class="icon-wrench" title="Settings"><span class="mText">Profile</span></router-link>
      <i title="Sign out" class="icon-sign-out"><span class="mText">Sign out</span></i>
    </nav>
    <router-view class="view"></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import Growl from "./ui/AppGrowl";
  import {State} from "vuex-class";

  @Component({
    components: {Growl}
  })
  export default class App extends Vue {
    @State growls: string[];
    @State theme;
    @State userInfo;

  }
</script>
<style lang="sass" scoped>
  .growlHolder
    top: 10px
    min-width: 250px
    /*51 is nav + margin
    left: 10px
    position: absolute
    max-width: 50%
    z-index: 4
    width: 400px
    max-height: calc(100% - 60px)

    /*55 is top, +5px bot
    overflow: hidden
    .progress-wrap
      width: 100%
  .holder
    height: 100vh
</style>