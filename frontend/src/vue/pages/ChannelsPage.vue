<template>
  <div class="holder">
    <!--    app-menu and popup menu requires to have activeRoomId not null, and painterPage dont have it. so use v-if-->
    <app-menu-bar v-if="showAppMenuBar" v-model="showAppMenuBar" @click.native="showAppMenuBar = false"/>
    <chat-nav-bar
      :current-page="currentChatPage"
      :low-width="lowWidth"
      @go-back="goBack"
      @show-menu="showAppMenuBar = true"
      @show-popup-toggle="showPopup = true"
    />
    <chat-popup-menu v-if="showPopup" @click.native="showPopup = false"/>
    <div class="wrapper">
      <chat-right-section v-show="!lowWidth || currentChatPage === 'rooms'"/>
      <chat-boxes v-show="!lowWidth || currentChatPage === 'chat'"/>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
  Watch,
} from "vue-property-decorator";

import ChatRightSection from "@/vue/chat/right/ChatRightSection.vue";
// Import NavEditMessage from '@/vue/chat/NavEditMessage.vue';
import ChatBoxes from "@/vue/chat/chatbox/ChatBoxes.vue";
import AppNavWrapper from "@/vue/ui/AppNavWrapper.vue";
import ChatIsOnlineIcon from "@/vue/chat/chatbox/ChatIsOnlineIcon.vue";
import {State} from "@/ts/instances/storeInstance";
import ChatPopupMenu from "@/vue/chat/chatbox/ChatPopupMenu.vue";
import AppMenuBar from "@/vue/ui/AppMenuBar.vue";
import ChatNavBar from "@/vue/chat/chatbox/ChatNavBar.vue";


@Component({
  name: "ChannelsPage",
  components: {
    ChatNavBar,
    AppMenuBar,
    ChatPopupMenu,
    ChatIsOnlineIcon,
    AppNavWrapper,
    ChatBoxes,
    ChatRightSection,
  },
})
export default class ChannelsPage extends Vue {
  public lowWidth = false;

  public showAppMenuBar = false;

  @State
  public readonly activeRoomId!: number;

  @State
  public readonly currentChatPage!: "chat" | "rooms";

  public showPopup = false;

  private listener!: Function;

  private mediaQuery!: MediaQueryList;

  @Watch("activeRoomId")
  public activeRoomIdChange() {
    if (this.lowWidth) {
      this.$store.setCurrentChatPage("chat");
    }
  }

  goBack() {
    this.$store.setCurrentChatPage("rooms");
  }

  created() {
    this.$store.setActiveRoomId(parseInt(this.$route.params.id as string));
    this.mediaQuery = window.matchMedia("(max-width: 700px)");
    this.listener = (e: MediaQueryList) => {
      this.lowWidth = e.matches;
    };
    this.listener(this.mediaQuery);
    this.mediaQuery.addListener(this.listener as any);
  }

  destroyed() {
    this.mediaQuery.removeListener(this.listener as any);
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"

.holder
  display: flex
  flex-direction: column

.wrapper
  @include flex(1)
  @include display-flex
  min-height: 0
  overflow-y: auto
  position: relative

</style>
