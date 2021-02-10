<template>
  <div class="current-room-users-table">
    <div class="current-room-users-table-header">
      {{ title }} <b>{{ room.name }}</b>
    </div>
    <ul>
      <li v-for="user in usersArray" :key="user.id">
        <user-flag-row :user="user"/>
      </li>
    </ul>
    <template v-if="userIds.length > 0">
      <div class="current-room-users-table-header">
        Invite more users
      </div>
      <div class="holder">
        <pick-user
          v-model="userdToAdd"
          :users-ids="userIds"
        />
        <app-submit
          type="button"
          value="Apply"
          class="green-btn"
          :running="running"
          @click.native="add"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  import {
    ApplyGrowlErr,
    State
  } from '@/ts/instances/storeInstance';
  import {
    ChannelsDictUIModel,
    RoomDictModel,
    UserDictModel
  } from '@/ts/types/model';
  import AppSubmit from '@/vue/ui/AppSubmit.vue';
  import PickUser from '@/vue/parts/PickUser.vue';
  import UserFlagRow from '@/vue/chat/right/UserFlagRow.vue';

  @Component({
  components: {UserFlagRow,  AppSubmit, PickUser}
})
export default class RoomUsersListPage extends Vue {

  @State
  public readonly allUsersDict!: UserDictModel;

  @State
  public readonly roomsDict!: RoomDictModel;

  @State
  public readonly channelsDictUI!: ChannelsDictUIModel;


  private userdToAdd: number[] = [];
  public running: boolean = false;


  get roomId(): number {
    return parseInt(this.$route.params.id);
  }

  get room() {
    return this.roomsDict[this.roomId];
  }

  get title() {
    return this.room.isMainInChannel ? 'Users in group' : 'Users in room';
  }

  get usersArray() {
    return this.room.users.map(id => this.allUsersDict[id]);
  }

  get userIds(): number[] {
    if (this.room.channelId && !this.room.isMainInChannel) {
      return this.channelsDictUI[this.room.channelId].mainRoom.users
          .filter(uId => !this.room.users.includes(uId))
    }
    return this.$store.usersArray
        .filter(u => this.room.users.indexOf(u.id) < 0)
        .map(u => u.id)
  }

  @ApplyGrowlErr({runningProp: 'running'})
  async add() {
    if (this.userdToAdd.length > 0) {
      const e = await this.$ws.inviteUser(this.roomId, this.userdToAdd);
      this.$router.replace(`/chat/${e.roomId}`);
    } else {
      this.$store.growlError("Please select at least one user");
    }
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/room_users_table.sass"

  @import "~@/assets/sass/partials/abstract_classes"

  .current-room-users-table-header
    font-size: 20px
    padding: 10px
  .holder
    @extend %room-settings-holder

  .green-btn
    flex-shrink: 0

  .current-room-users-table
    font-size: 24px
    width: 350px
    margin: auto

  ul
    @extend %ul

  li
    @extend %li
    justify-content: space-between
    display: flex

  .usersStateText:hover
    cursor: pointer
    color: #f1f1f1
</style>
