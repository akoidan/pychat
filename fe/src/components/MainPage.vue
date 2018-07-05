<template>
  <div class="flex">
    <app-nav v-show="showNav"/>
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
  import {UserModel} from "../types/model";
  import NotifierHandler from "../utils/NotificationHandler";
  import {browserVersion, isChrome, isMobile, notifier} from "../utils/singletons";
  import store from '../store';
  import AppSpinner from './ui/AppSpinner';

  @Component({
    components: {AppSpinner, AppNav}
  })
  export default class MainPage extends Vue {

    @Getter showNav: boolean;
    @State userInfo: UserModel;

    get inited() {
      return this.userInfo;
    }

    created() {
      notifier.tryAgainRegisterServiceWorker();
      this.$ws.startListening();
    }

    destroy() {

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


</style>