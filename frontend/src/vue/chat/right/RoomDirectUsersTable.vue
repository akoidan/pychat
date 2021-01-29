<template>
  <chat-right-collapsed-section
    v-model="privateRoomCollapsed"
  >
    <template v-slot:name>
      Users
    </template>
    <room-users-private
      v-for="room in privateRooms"
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
import RoomUsersPrivate from '@/vue/chat/right/RoomUsersPrivate.vue';
import {State} from '@/ts/instances/storeInstance';
import {RoomModel} from '@/ts/types/model';
import ChatRightCollapsedSection
  from '@/vue/chat/right/ChatRightCollapsedSection.vue';

@Component({
  components: {ChatRightCollapsedSection, RoomUsersPrivate}
})
export default class RoomDirectUsersTable extends Vue {

  @State
  public readonly privateRooms!: RoomModel[];

  private privateRoomCollapsed: boolean = false;

}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

</style>
