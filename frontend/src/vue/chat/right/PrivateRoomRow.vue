<template>
  <room-row-wrapper :class="onlineActiveClass" :room="room">
    <user-row :user="user"/>
  </room-row-wrapper>
</template>
<script lang="ts">
import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import type {UserModel} from "@/ts/types/model";
import {RoomModel} from "@/ts/types/model";
import {PrivateRoomsIds} from "@/ts/types/types";
import RoomRightIcon from "@/vue/chat/right/RoomRightIcon.vue";
import RoomRowWrapper from "@/vue/chat/right/RoomRowWrapper.vue";
import UserRow from "@/vue/chat/right/UserRow.vue";

@Component({
  name: "PrivateRoomRow",
  components: {
    UserRow,
    RoomRowWrapper,
    RoomRightIcon,
  },
})
export default class PrivateRoomRow extends Vue {
  @Prop() public room!: RoomModel;

  @State
  public readonly online!: number[];

  @State
  public readonly privateRoomsUsersIds!: PrivateRoomsIds;

  @State
  public readonly allUsersDict!: Record<number, UserModel>;

  public get user() {
    return this.allUsersDict[this.privateRoomsUsersIds.roomUsers[this.room.id]];
  }

  public get onlineActiveClass(): string {
    return this.isOnline ? "offline" : "online";
  }

  private get isOnline() {
    return !this.online.includes(this.user.id);
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

.online :deep(.online-marker)
  display: block
</style>
