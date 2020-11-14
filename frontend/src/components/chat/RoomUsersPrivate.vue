<template>
  <li :class="onlineActiveClass">
    <router-link :to="`/chat/${room.id}`" class="link">
      <user-name-sex :user="user" :online="isOnline"/>
    </router-link>
    <room-right-icon :room="room" />
  </li>
</template>
<script lang="ts">
import { State } from '@/utils/storeHolder';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import {
  CurrentUserInfoModel,
  RoomModel,
  UserModel
} from '@/types/model';
import { PrivateRoomsIds } from '@/types/types';
import RoomRightIcon from '@/components/chat/RoomRightIcon.vue';
import UserNameSex from '@/components/chat/UserNameSex.vue';

@Component({
  components: {UserNameSex, RoomRightIcon}
})
export default class RoomUsersPrivate extends Vue {

  @Prop() public room!: RoomModel;
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

  private get isOnline() {
    return this.online.indexOf(this.user.id) < 0;
  }

  get onlineActiveClass (): string[] {
    const a = [this.isOnline ? 'offline' : 'online'];
    if (this.room.id === this.activeRoomId) {
      a.push('active-room');
    }

    return a;
  }

}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li
  .active-room
    @extend %active-room
  .link
    @extend %link
</style>
