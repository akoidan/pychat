<template>
  <div class="direct-user-table">
    <span class="header">
      <span
        :class="directClass"
        @click="directMinified = !directMinified"
      />
      <span class="directStateText">direct messages</span>
      <router-link
        to="/create-private-room"
        class="icon-plus-squared"
        title="Create direct room"
      />
    </span>
    <ul v-show="!directMinified">
      <room-users-private
        v-for="room in privateRooms"
        :key="room.id"
        :room="room"
      />
    </ul>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import RoomUsersPrivate from '@/vue/chat/RoomUsersPrivate.vue';
import { State } from '@/ts/instances/storeInstance';
import { RoomModel } from '@/ts/types/model';

@Component({
    components: {RoomUsersPrivate}
  })
  export default class RoomDirectUsersTable extends Vue {

    @State
    public readonly privateRooms!: RoomModel[];

    public directMinified: boolean = false;

    get directClass() {
      return this.directMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down';
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/room_users_table.sass"

  .direct-user-table
    font-size: 24px
  .icon-angle-circled-down, .icon-angle-circled-up
    @extend %header-left-icon
  .icon-plus-squared
    @extend %header-right-icon
  .header
    @extend %header
  ul
    @extend %ul
</style>
