<template>
  <room-row-wrapper :room="room" :class="onlineActiveClass">
    <user-row :user="user"></user-row>
  </room-row-wrapper>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import {
  CurrentUserInfoModel,
  RoomModel,
  UserModel
} from '@/ts/types/model';
import { PrivateRoomsIds } from '@/ts/types/types';
import RoomRightIcon from '@/vue/chat/right/RoomRightIcon';
import RoomRowWrapper from '@/vue/chat/right/RoomRowWrapper';
import UserRow from '@/vue/chat/right/UserRow';

@Component({
  name: 'PrivateRoomRow' ,
  components: {UserRow, RoomRowWrapper,  RoomRightIcon}
})
export default class PrivateRoomRow extends Vue {

  @Prop() public room!: RoomModel;
  @State
  public readonly online!: number[];
  @State
  public readonly privateRoomsUsersIds!: PrivateRoomsIds;
  @State
  public readonly allUsersDict!: { [id: number]: UserModel } ;

  get user() {
    return this.allUsersDict[this.privateRoomsUsersIds.roomUsers[this.room.id]];
  }

  private get isOnline() {
    return this.online.indexOf(this.user.id) < 0;
  }

  get onlineActiveClass (): string {
    return this.isOnline ? 'offline' : 'online';
  }

}
</script>

<style lang="sass" scoped>
  .user-icon
    width: 60px
    display: flex
    justify-content: space-around

  .online, .offline
    padding-left: 0
  .online ::v-deep .online-marker
    display: block
</style>
