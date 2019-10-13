<template>
  <li :class="onlineActiveClass">
    <router-link :to="`/chat/${room.id}`">
      <i :class="userSexClass"></i>{{user.user}}
    </router-link>
    <router-link :to="`/room-settings/${room.id}`" v-if="!room.newMessagesCount">
      <span class="icon-cog"></span>
    </router-link>
    <span class="newMessagesCount" v-if="room.newMessagesCount">{{room.newMessagesCount}}</span>
  </li>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfoModel, RoomModel, UserModel} from "@/types/model";
  import {getUserSexClass} from '@/utils/htmlApi';
  import {PrivateRoomsIds} from '@/types/types';

  @Component
  export default class RoomUsersPrivate extends Vue {

    @Prop() room!: RoomModel;
    @State
    public readonly online!: number[];
    @State
    public readonly activeRoomId!: number;
    @State
    public readonly privateRoomsUsersIds!: PrivateRoomsIds;
    @State
    public readonly userInfo!: CurrentUserInfoModel;
    @State
    public readonly allUsersDict!: { [id: number]: UserModel } ;

    get user() {
      return this.allUsersDict[this.privateRoomsUsersIds.roomUsers[this.room.id]];
    }

    get onlineActiveClass () : string[] {
      const a = [this.online.indexOf(this.user.id) < 0 ? "offline" : "online"];
      if (this.room.id === this.activeRoomId) {
        a.push('active-room');
      }
      return a;
    }

    get userSexClass () {
      return getUserSexClass(this.user);
    }
  }
</script>

<style lang="sass" scoped>
</style>
