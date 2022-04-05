<template>
  <div class="flex">
    <app-nav-wrapper v-show="!$route.meta.hasOwnNavBar">
      <chat-back-icon/>
    </app-nav-wrapper>
    <incoming-call
      v-if="incomingCall"
      :call="incomingCall"
    />
    <router-view v-if="inited" v-slot="{Component, route}">
      <keep-alive include="PainterPage,ChannelsPage">
        <component
          :is="Component"
          class="body"
        />
      </keep-alive>
    </router-view>
    <div v-else class="spinner"/>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {
  CurrentUserInfoModel,
  IncomingCallModel,
} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";
import IncomingCall from "@/vue/chat/call/IncomingCall.vue";
import AppNavWrapper from "@/vue/ui/AppNavWrapper.vue";
import ChatBackIcon from "@/vue/chat/chatbox/ChatBackIcon.vue";
import type {SetStateFromStorage} from "@/ts/types/dto";

@Component({
  name: "MainPage",
  components: {
    ChatBackIcon,
    AppNavWrapper,
    IncomingCall,
  },
})
export default class MainPage extends Vue {
  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly incomingCall!: IncomingCallModel;

  public get inited() {
    return this.userInfo;
  }

  public async created() {
    this.$logger.log("Main page has been created, fire listening ws, and register notification")();
    try {

      /*
       * Should be before startListen, so syncHistory is called AFTER  this.$store.setStateFromStorage(data);
       * also we don't care if after login it's called twice, cause it seems it doesnt cause any issues
       */
      const data: SetStateFromStorage | null = await this.$store.getStorage.connect();
      this.$logger.log("restored state from db {}, userId: {", data, this.$store.myId)();
      if (data) {
        this.$store.setStateFromStorage(data);
      }
    } catch (e) {
      this.$logger.error("Unable to restore state from db {}", e)();
    }

    this.$ws.startListening(); // Should not fail main component if ws is not available
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/abstract_classes"

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
