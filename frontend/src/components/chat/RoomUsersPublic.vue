<template>
  <li :class="activeClass">
    <router-link :to="`/chat/${room.id}`" class="link">
      {{ room.name }}
    </router-link>
    <room-right-icon :room="room" />
  </li>
</template>
<script lang="ts">
import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {RoomModel} from '@/types/model';
import RoomRightIcon from '@/components/chat/RoomRightIcon.vue';
@Component({
  components: {RoomRightIcon}
})
export default class RoomUsersPublic extends Vue {
  @Prop() public room!: RoomModel;
  @State
  public readonly activeRoomId!: number;

  get activeClass() {
    return this.room.id === this.activeRoomId ? 'active-room' : null;
  }

}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li
  .active-room
    @extend %active-room
  .link
    @extend %link
</style>
