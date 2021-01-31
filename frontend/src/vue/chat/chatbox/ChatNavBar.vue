<template>
  <app-nav-wrapper>
    <i class="icon-left" @click="goBack" v-if="lowWidth && currentPage === 'chat'"/>
    <i class="icon-menu" v-else @click="showMenu"/>
    <template v-if="lowWidth">
      <span class="room-name">{{roomName}}</span>
    </template>
    <div class="chat-right-icons">
      <chat-is-online-icon/>
      <i class="icon-chat" @click="showPopupToggle" v-if="!lowWidth || currentPage === 'chat'"/>
    </div>
  </app-nav-wrapper>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref, Emit} from 'vue-property-decorator';
  import AppNavWrapper from '@/vue/ui/AppNavWrapper.vue';
  import {State} from '@/ts/instances/storeInstance';
  import {
    ChannelsDictUIModel,
    RoomModel,
    UserDictModel,
    UserModel
  } from '@/ts/types/model';
  import ChatIsOnlineIcon from '@/vue/chat/chatbox/ChatIsOnlineIcon.vue';
  import {PrivateRoomsIds} from '@/ts/types/types';
  @Component({
    components: {ChatIsOnlineIcon, AppNavWrapper}
  })
  export default class ChatNavBar extends Vue {
    @State
    public readonly activeRoom!: RoomModel;

    @Prop()
    private readonly lowWidth!: boolean;

    @Prop()
    private readonly currentPage!: string;

    @State
    public readonly privateRoomsUsersIds!: PrivateRoomsIds;

    @State
    public readonly channelsDictUI!: ChannelsDictUIModel;

    @State
    public readonly allUsersDict!: UserDictModel;

    get roomName(): string  {
      if (this.activeRoom.name) {
        return this.activeRoom.name;
      }
      if (this.activeRoom.isMainInChannel) {
        return this.channelsDictUI[this.activeRoom.channelId!].name;
      }
      if (!this.activeRoom.name) {
        return  this.allUsersDict[this.privateRoomsUsersIds.roomUsers[this.activeRoom.id]].user;
      }
      throw Error('Invalid structure');
    }

    @Emit()
    goBack() {}

    @Emit()
    showPopupToggle(e: Event) {
      e.stopPropagation();
    }

    @Emit()
    showMenu(e: Event) {
      e.stopPropagation();
    }

  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  .room-name
    margin-left: 10px
  .chat-right-icons
    margin-left: auto
  .icon-chat
    margin-right: 20px
  .icon-menu, .icon-chat
    cursor: pointer
</style>
