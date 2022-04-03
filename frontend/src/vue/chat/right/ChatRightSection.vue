<template>
  <div class="chat-room-users-wrapper">
    <room-direct-users-table/>
    <channel-table
      v-for="channel in channels"
      :key="channel.id"
      :channel="channel"
    />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import RoomDirectUsersTable from "@/vue/chat/right/RoomDirectUsersTable.vue";
import ChannelTable from "@/vue/chat/right/ChannelTable.vue";
import type {ChannelUIModel} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";

@Component({
  name: "ChatRightSection",
  components: {
    ChannelTable,
    RoomDirectUsersTable,
  },
})
export default class ChatRightSection extends Vue {
  @State
  public readonly channels!: ChannelUIModel[];
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/abstract_classes"

.chat-room-users-wrapper
  float: right
  overflow-y: scroll
  overflow-x: hidden
  position: relative
  min-width: 300px
  @media screen and (max-width: $collapse-width)
    width: 100%
    min-width: 200px

.color-white .chat-room-users-wrapper
  color: $color-white-main


</style>
