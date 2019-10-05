<template>
  <div class="flex">
    <div v-if="dim" class="wait"></div>
    <app-nav v-show="showNav"/>
    <incoming-call v-if="incomingCall" :call="incomingCall"/>
    <keep-alive v-if="inited" :include="['ChannelsPage', 'Painter']">
      <router-view class="body"/>
    </keep-alive>
    <div v-else class="spinner"/>
  </div>
</template>
<script lang="ts">

  import AppNav from "@/components/AppNav.vue";
  import {Component, Vue} from "vue-property-decorator";
  import {
    CurrentUserInfoModel,
    IncomingCallModel,
    UserModel
  } from "@/types/model";
  import NotifierHandler from "@/utils/NotificationHandler";
  import {browserVersion, isChrome, isMobile, notifier} from "@/utils/singletons";
  import {store} from '@/utils/storeHolder';
  import IncomingCall from '@/components/chat/IncomingCall';

  @Component({
    components: {IncomingCall, AppNav}
  })
  export default class MainPage extends Vue {

    get showNav(): boolean  { return store.showNav };
    get userInfo(): CurrentUserInfoModel  { return store.userInfo }
    get incomingCall(): IncomingCallModel  { return store.incomingCall }
    get dim(): boolean  { return store.dim }

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
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"

  .spinner
    margin: auto
    @include lds-30-spinner-vertical('Loading user data...')

  .flex
    height: 100%
    @include display-flex()
    flex-direction: column

  nav
    @extend %nav

  .body
    flex: 1
    min-height: 0

  .wait
    cursor: wait
    display: block
    position: fixed
    background-color: #000
    opacity: 0.5
    background-repeat: no-repeat
    background-position: center
    left: 0
    bottom: 0
    right: 0
    top: 0


</style>
