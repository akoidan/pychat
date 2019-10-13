<template>
  <li :class="activeClass">
    <router-link :to="`/chat/${room.id}`">
      {{ room.name }}
    </router-link>
    <router-link :to="`/room-settings/${room.id}`">
      <span class="icon-cog" v-if="!room.newMessagesCount"></span>
    </router-link>
    <span class="newMessagesCount" v-if="room.newMessagesCount">{{room.newMessagesCount}}</span>
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
