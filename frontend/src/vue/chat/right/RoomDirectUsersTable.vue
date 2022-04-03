<template>
  <chat-right-collapsed-section
    v-model="privateRoomCollapsed"
  >
    <template #name>
      Users
    </template>
    <private-room-row
      v-for="room in privateRooms"
      :key="room.id"
      :room="room"
    />
  </chat-right-collapsed-section>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import PrivateRoomRow from "@/vue/chat/right/PrivateRoomRow.vue";
import {State} from "@/ts/instances/storeInstance";
import type {RoomModel} from "@/ts/types/model";
import ChatRightCollapsedSection from "@/vue/chat/right/ChatRightCollapsedSection.vue";

@Component({
  name: "RoomDirectUsersTable",
  components: {
    ChatRightCollapsedSection,
    PrivateRoomRow,
  },
})
export default class RoomDirectUsersTable extends Vue {
  @State
  public readonly privateRooms!: RoomModel[];

  public privateRoomCollapsed: boolean = false;
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

</style>
