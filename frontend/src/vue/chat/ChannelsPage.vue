<template>
  <div class="holder">
    <app-menu-bar v-show="showAppMenuBar"/>
    <app-nav-wrapper >
      <i class="icon-left" @click="goBack" v-if="lowWidth && currentPage === 'chat'"/>
      <i class="icon-menu" v-else @click="showMenu"/>
      <div class="chat-right-icons">
        <chat-is-online-icon/>
        <i class="icon-chat" @click="showPopupToggle"/>
      </div>
    </app-nav-wrapper>
    <chat-popup-menu v-show="showPopup" class="popup-menu"/>
    <div class="wrapper">
      <chat-right-section v-show="!lowWidth || currentPage === 'rooms'" />
      <chat-boxes v-show="!lowWidth || currentPage === 'chat'"/>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Watch, Ref} from 'vue-property-decorator';

import ChatRightSection from '@/vue/chat/ChatRightSection.vue';
// import NavEditMessage from '@/vue/chat/NavEditMessage.vue';
import ChatBoxes from '@/vue/chat/ChatBoxes.vue';
import AppNavWrapper from '@/vue/ui/AppNavWrapper.vue';
import {isMobile} from '@/ts/utils/runtimeConsts';
import ChatIsOnlineIcon from '@/vue/chat/ChatIsOnlineIcon.vue';
import {State} from '@/ts/instances/storeInstance';
import ChatPopupMenu from '@/vue/chat/ChatPopupMenu.vue';
import AppMenuBar from '@/vue/ui/AppMenuBar.vue';


@Component({components: {
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
  private currentPage: 'rooms' | 'chat' = 'chat';
  private showPopup = false;

  @Watch('activeRoomId')
  public activeRoomIdChange() {
    if (this.lowWidth) {
      this.currentPage = 'chat';
    }
  }

  goBack() {
    this.currentPage = 'rooms';
  }

  clickOutsideEvent!: any;

  showMenu() {
    this.showAppMenuBar = true;
    setTimeout(() => { // otherwise listener will be triggered right away
        document.body.addEventListener('click', this.clickOutsideEvent)
    });
  }

  showPopupToggle() {
    this.showPopup = true;
    setTimeout(() => { // otherwise listener will be triggered right away
      document.body.addEventListener('click', this.clickOutsideEvent)
    });
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
  .chat-right-icons
    margin-left: auto
  .icon-chat
    margin-right: 20px
  .icon-menu, .icon-chat
    cursor: pointer
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
