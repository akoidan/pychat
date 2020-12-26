<template>
  <div class="room-public-table">
    <span class="header">
      <span
        :class="roomsClass"
        @click="roomsMinified = !roomsMinified"
      />
      <span class="channelsStateText">rooms</span>
      <router-link
        to="/create-room/public"
        class="icon-plus-squared"
        title="Create public room"
      />
    </span>
    <ul
      v-show="!roomsMinified"
      class="rooms"
    >
      <channel-li v-for="channel in channels" :channel="channel" :key="'c'+channel.id"/>

      <room-users-public
        v-for="room in publicRooms"
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
import ChannelLi from '@/vue/chat/ChannelLi.vue';
import RoomUsersPublic from '@/vue/chat/RoomUsersPublic.vue';
import { State } from '@/ts/instances/storeInstance';
import {
  ChannelUIModel,
  RoomModel
} from '@/ts/types/model';

@Component({
    components: {RoomUsersPublic, ChannelLi}
  })
  export default class RoomPublicTable extends Vue {

    @State
    public readonly channels!: ChannelUIModel[];

    public roomsMinified: boolean = false;

    @State
    public readonly publicRooms!: RoomModel[];

    get roomsClass() {
      return this.roomsMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down';
    }

  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  .room-public-table
    font-size: 24px
  @import "~@/assets/sass/partials/room_users_table.sass"

  .icon-angle-circled-down, .icon-angle-circled-up
    @extend %header-left-icon

  .icon-plus-squared
    @extend %header-right-icon

  .header
    @extend %header

  ul
    @extend %ul
</style>
