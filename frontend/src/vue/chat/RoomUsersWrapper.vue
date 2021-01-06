<template>
  <li :class="activeClass">
    <router-link :to="`/chat/${room.id}`" class="link" @click.native="navigate">
      <slot/>
    </router-link>
    <room-right-icon :room="room" />
  </li>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Watch,
    Ref
  } from 'vue-property-decorator';
  import RoomRightIcon from '@/vue/chat/RoomRightIcon.vue';
  import {RoomModel} from '@/ts/types/model';
  import {State} from '@/ts/instances/storeInstance';
  @Component({
    components: {RoomRightIcon}
  })
  export default class RoomUsersWrapper extends Vue {
    @Prop() public room!: RoomModel;

    @State
    public readonly activeRoomId!: number;

    @State
    public readonly currentChatPage!: 'chat'|'rooms';

    get activeClass() {
      return this.room.id === this.activeRoomId ? 'active-room' : null;
    }

    navigate() {
      if (this.activeRoomId === this.room.id) {
        this.$store.setCurrentChatPage('chat');
      }
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li

  .link
    @extend %link

  .active-room
    @extend %active-room
</style>
