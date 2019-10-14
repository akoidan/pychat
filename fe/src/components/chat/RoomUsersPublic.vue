<template>
  <li :class="activeClass">
    <router-link :to="`/chat/${room.id}`">
      {{ room.name }}
    </router-link>
    <router-link :to="`/room-settings/${room.id}`">
      <span
        v-if="!room.newMessagesCount"
        class="icon-cog"
      />
    </router-link>
    <span
      v-if="room.newMessagesCount"
      class="newMessagesCount"
    >{{ room.newMessagesCount }}</span>
  </li>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {RoomModel} from "@/types/model";

  @Component
  export default class RoomUsersPublic extends Vue {
    @Prop() room!: RoomModel;
    @State
    public readonly activeRoomId!: number;

    get activeClass() {
      return this.room.id === this.activeRoomId ? 'active-room' : null;
    }

  }
</script>

<style lang="sass" scoped>
</style>
