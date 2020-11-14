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
import { ChannelUIModel } from '@/types/model';
import RoomUsersPublic from '@/components/chat/RoomUsersPublic.vue';

@Component({
    components: {RoomUsersPublic}
  })
  export default class ChannelLi extends Vue {

    @Prop() public channel!: ChannelUIModel;

    public expandChannel(id: number) {
      this.$store.expandChannel(id);
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li
    color: #b89e00
  .icon-cog
    @extend %icon-cog
</style>
