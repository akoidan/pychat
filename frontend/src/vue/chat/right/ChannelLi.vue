<template>
  <div>
    <li @click="expandChannel(channel.id)">
      {{ channel.name }}

      <router-link :to="`/channel-settings/${channel.id}`">
        <span class="icon-cog"/>
      </router-link>
    </li>
    <room-users-public
      class="channel-room"
      v-show="channel.expanded"
      v-for="room in channel.rooms"
      :key="room.id"
      :room="room"
    />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { ChannelUIModel } from '@/ts/types/model';
import RoomUsersPublic from '@/vue/chat/right/RoomUsersPublic.vue';

@Component({
    components: {RoomUsersPublic}
  })
  export default class ChannelLi extends Vue {

    @Prop() public channel!: ChannelUIModel;


  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li
    &:hover
      padding-right: 25px
    color: #b89e00
  .icon-cog
    @extend %icon-cog
</style>
