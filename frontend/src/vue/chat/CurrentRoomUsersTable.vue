<template>
  <div>
    <span class="header">
      <span
        :class="onlineClass"
        @click="onlineMinified = !onlineMinified"
      />
      <span
        :title="titleOnlineText"
        class="usersStateText"
        @click="switchUserState"
      >{{ onlineText }}</span>
      <router-link
        :to="`/invite-user/${activeRoomId}`"
        class="icon-user-plus"
        title="Add user to current active channel"
      />
    </span>
    <ul v-show="!onlineMinified" :class="{onlineShowOnlyOnline}">
      <room-users-user
        v-for="user in usersArray"
        :key="user.id"
        :user="user"
      />
    </ul>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import { State } from '@/ts/instances/storeInstance';
import { UserModel } from '@/ts/types/model';
import RoomUsersUser from '@/vue/chat/RoomUsersUser.vue';

@Component({
  components: {RoomUsersUser}
})
export default class CurrentRoomUsersTable extends Vue {
  @State
  public readonly usersArray!: UserModel[];

  @State
  public readonly activeRoomId!: number;

  public onlineShowOnlyOnline: boolean = false;

  public onlineMinified: boolean = false;

  get onlineClass() {
    return this.onlineMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down';
  }

  get onlineText() {
    return this.onlineShowOnlyOnline ? 'Room Online': 'Room Users';
  }

  get titleOnlineText() {
    return this.onlineShowOnlyOnline ? 'Click to display only online users' : 'Click to display all users';
  }

  private switchUserState(): void {
    this.onlineShowOnlyOnline = !this.onlineShowOnlyOnline;
    this.onlineMinified = false;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/room_users_table.sass"

  .icon-angle-circled-down, .icon-angle-circled-up
    @extend %header-left-icon

  .icon-user-plus
    @extend %header-right-icon

  .header
    @extend %header

  ul
    @extend %ul
    &.onlineShowOnlyOnline
      .offline
        display: none

  .usersStateText:hover
    cursor: pointer
    color: #f1f1f1
</style>
