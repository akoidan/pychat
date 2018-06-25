<template>
  <div class="flex">
    <app-nav v-show="showNav"/>
    <keep-alive v-if="inited" :include="['ChannelsPage']">
      <router-view class="body"/>
    </keep-alive>
    <div v-else class="spinner">
      <div class="text">Connecting...</div>
      <div class="sp"></div>
    </div>
  </div>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import AppNav from "./AppNav.vue";
  import {Component, Vue} from "vue-property-decorator";
  import {UserModel} from "../types/model";

  @Component({
    components: {AppNav}
  })
  export default class MainPage extends Vue {

    @Getter showNav: boolean;
    @State userInfo: UserModel;

    get inited() {
      return this.userInfo;
    }

    created() {
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

  .spinner
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    .sp
      @include spinner(10px, white)
    .text
      padding-right: 20px
      font-size: 40px
</style>