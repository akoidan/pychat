<template>
  <div class="holder">
    <app-menu-bar v-show="showAppMenuBar"/>
    <chat-nav-bar
      :low-width="lowWidth"
      :current-page="currentChatPage"
      @go-back="goBack"
      @show-menu="showMenu"
      @show-popup-toggle="showPopupToggle"
    />
    <chat-popup-menu v-show="showPopup" class="popup-menu"/>
    <div class="wrapper">
      <chat-right-section v-show="!lowWidth || currentChatPage === 'rooms'" />
      <chat-boxes v-show="!lowWidth || currentChatPage === 'chat'"/>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Watch, Ref} from 'vue-property-decorator';

import ChatRightSection from '@/vue/chat/right/ChatRightSection.vue';
// import NavEditMessage from '@/vue/chat/NavEditMessage.vue';
import ChatBoxes from '@/vue/chat/ChatBoxes.vue';
import AppNavWrapper from '@/vue/ui/AppNavWrapper.vue';
import {isMobile} from '@/ts/utils/runtimeConsts';
import ChatIsOnlineIcon from '@/vue/chat/ChatIsOnlineIcon.vue';
import {State} from '@/ts/instances/storeInstance';
import ChatPopupMenu from '@/vue/chat/ChatPopupMenu.vue';
import AppMenuBar from '@/vue/ui/AppMenuBar.vue';
import {RoomModel, UserDictModel, UserModel} from '@/ts/types/model';
import {PrivateRoomsIds} from '@/ts/types/types';
import ChatNavBar from '@/vue/chat/ChatNavBar.vue';


@Component({components: {
    ChatNavBar,
  AppMenuBar,
  ChatPopupMenu,
  ChatIsOnlineIcon,
  AppNavWrapper,
  ChatBoxes,
  ChatRightSection
}})
export default class ChannelsPage extends Vue {

  @State
  public readonly activeRoomId!: number;

  private listener!: Function;
  private mediaQuery!: MediaQueryList;
  private lowWidth = false;
  private showAppMenuBar = false;

  @State
  public readonly currentChatPage!: 'rooms' | 'chat';
  private showPopup = false;



  @Watch('activeRoomId')
  public activeRoomIdChange() {
    if (this.lowWidth) {
      this.$store.setCurrentChatPage('chat');
    }
  }

  goBack() {
    this.$store.setCurrentChatPage('rooms');
  }

  clickOutsideEvent!: any;

  showMenu() {
    this.showAppMenuBar = !this.showAppMenuBar;
    document.body.addEventListener('click', this.clickOutsideEvent)
  }

  showPopupToggle() {
    this.showPopup = !this.showPopup;
    document.body.addEventListener('click', this.clickOutsideEvent)
  }

  created() {
    this.mediaQuery = window.matchMedia('(max-width: 700px)');
    this.listener = (e: MediaQueryList) => {
      this.lowWidth = e.matches;
    };
    this.listener(this.mediaQuery)
    this.mediaQuery.addListener(this.listener as any);

    this.clickOutsideEvent = (event: any) => {
      document.body.removeEventListener('click', this.clickOutsideEvent)
      this.showPopup = false;
      this.showAppMenuBar = false;
    };

  }

  destroyed() {
    this.mediaQuery.removeListener(this.listener as any);
  }

}
</script>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"


  .popup-menu
    position: absolute
    top: 40px
    right: 5px
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
