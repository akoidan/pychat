<template>
  <chat-right-collapsed-section
    v-model="roomsMinified"
  >
    <template v-slot:name>
      Rooms
    </template>
    <template v-slot:right>
      <router-link
        to="/create-room/public"
        class="icon-plus-squared"
        title="Create public room"
      />
    </template>
    <room-users-public
      v-for="room in publicRooms"
      :key="room.id"
      :room="room"
    />
  </chat-right-collapsed-section>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import ChannelLi from '@/vue/chat/right/ChannelLi.vue';
import RoomUsersPublic from '@/vue/chat/right/RoomUsersPublic.vue';
import { State } from '@/ts/instances/storeInstance';
import {
  ChannelUIModel,
  RoomModel
} from '@/ts/types/model';
import ChatRightCollapsedSection
  from '@/vue/chat/right/ChatRightCollapsedSection.vue';

@Component({
    components: {ChatRightCollapsedSection, RoomUsersPublic, ChannelLi}
  })
  export default class RoomPublicTable extends Vue {

    public roomsMinified: boolean = false;

    @State
    public readonly publicRooms!: RoomModel[];

  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
</style>
