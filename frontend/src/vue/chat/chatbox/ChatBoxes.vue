<template>
  <div class="chatBoxHolder">
    <template v-for="room in roomsArray">
      <chat-box
        v-if="roomInited[room.id]"
        v-show="activeRoomId === room.id"
        :key="room.id"
        :room="room"
      />
    </template>
    <div
      v-if="!activeRoom"
      class="noRoom"
    >
      <router-link :to="`/chat/${ALL_ROOM_ID}`">
        This room doesn't exist, or you don't have access to it. Click to go to main room
      </router-link>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Vue, Watch,} from "vue-property-decorator";
import ChatBox from "@/vue/chat/chatbox/ChatBox.vue";
import {State} from "@/ts/instances/storeInstance";
import {ALL_ROOM_ID} from "@common/consts";
import {RoomModel} from "@/ts/types/model";


@Component({
  name: "ChatBoxes",
  components: {ChatBox},
})
export default class ChatBoxes extends Vue {
  @State
  public readonly roomsArray!: RoomModel[];

  // Do not render all messages in all rooms, this is too slow
  public roomInited: Record<string, boolean> = {};

  @State
  public readonly activeRoom!: RoomModel;

  @State
  public readonly activeRoomId!: number;

  public get ALL_ROOM_ID(): number {
    return ALL_ROOM_ID;
  }

  created() {
    // Vue.set
    this.roomInited[this.activeRoomId] = true;
  }

  @Watch("activeRoomId")
  public onActiveRoomIdChange(newValue: number) {
    // Vue.set
    this.roomInited[newValue] = true;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"


.noRoom
  justify-content: center
  align-items: center
  display: flex
  font-size: 30px
  margin-top: 30px

  > *
    text-align: center
    color: #8fadff
    cursor: pointer

    &:hover
      text-decoration: underline

.chatBoxHolder
  +wrapper-inner
  overflow-y: auto
  position: relative
  @include flex-direction(column)

</style>
