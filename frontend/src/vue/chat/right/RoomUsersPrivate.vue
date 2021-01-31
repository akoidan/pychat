<template>
  <room-users-wrapper :room="room" :class="onlineActiveClass">

    <div class="user-icon">
      <user-icon-or-sex :user="user"/>
    </div>
    <span>{{ user.user }}</span>
  </room-users-wrapper>
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
import RoomRightIcon from '@/vue/chat/right/RoomRightIcon.vue';
import UserNameSex from '@/vue/chat/chatbox/UserNameSex.vue';
import RoomUsersWrapper from '@/vue/chat/right/RoomUsersWrapper.vue';
import UserIconOrSex from '@/vue/chat/chatbox/UserIconOrSex.vue';

@Component({
  components: {UserIconOrSex, RoomUsersWrapper, UserNameSex, RoomRightIcon}
})
export default class RoomUsersPrivate extends Vue {

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
</style>
