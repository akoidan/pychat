<template>
  <div class="flex">
    <div v-if="dim" class="wait"></div>
    <app-nav v-show="showNav"/>
    <incoming-call v-if="incomingCall" :call="incomingCall"/>
    <keep-alive v-if="inited" :include="['ChannelsPage', 'Painter']">
      <router-view class="body"/>
    </keep-alive>
    <app-spinner v-else text="Connecting..."/>
  </div>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import AppNav from "./AppNav.vue";
  import {Component, Vue} from "vue-property-decorator";
  import {IncomingCallModel, UserModel} from "../types/model";
  import NotifierHandler from "../utils/NotificationHandler";
  import {browserVersion, isChrome, isMobile, notifier} from "../utils/singletons";
  import store from '../store';
  import AppSpinner from './ui/AppSpinner';
  import IncomingCall from './chat/IncomingCall';

  @Component({
    components: {IncomingCall, AppSpinner, AppNav}
  })
  export default class MainPage extends Vue {

    @Getter showNav: boolean;
    @State userInfo: UserModel;
    @State incomingCall: IncomingCallModel;
    @State dim: boolean;

    get inited() {
      return this.userInfo;
    }

    created() {
      notifier.tryAgainRegisterServiceWorker();
      this.$ws.startListening();
    }

  }
</script>

<style lang="sass" scoped>
  @import "partials/mixins"
  @import "partials/abstract_classes"
  .flex
    height: 100%
    @include display-flex()
    flex-direction: column

  nav
    @extend %nav

  .body
    height: 100%

  .wait
    cursor: wait
    display: block
    position: fixed
    z-index: 1
    background-color: #000
    opacity: 0.5
    background-repeat: no-repeat
    background-position: center
    left: 0
    bottom: 0
    right: 0
    top: 0


</style>