<template>
  <chat-right-collapsed-section :value="channel.expanded" @input="expandChannel">
    <template #name>
      <router-link
        :to="`/chat/${mainRoomId(channel)}`"
        class="active-room"
        @click.native="navigate"
      >
        {{ channel.name }}
      </router-link>
    </template>

    <room-row-wrapper
      v-for="room in channel.rooms"
      :key="room.id"
      :room="room"
    >
      {{ room.name }}
    </room-row-wrapper>
  </chat-right-collapsed-section>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";
import {ChannelUIModel} from "@/ts/types/model";
import ChatRightCollapsedSection from "@/vue/chat/right/ChatRightCollapsedSection.vue";
import RoomRowWrapper from "@/vue/chat/right/RoomRowWrapper.vue";

@Component({
  name: "ChannelTable",
  components: {
    RoomRowWrapper,
    ChatRightCollapsedSection,
  },
})
export default class ChannelTable extends Vue {
  @Prop()
  public readonly channel!: ChannelUIModel;

  @State
  public readonly activeRoomId!: number;

  public navigate() {
    if (this.activeRoomId === this.channel.mainRoom.id) {
      this.$store.setCurrentChatPage("chat");
    }
  }

  mainRoomId(channel: ChannelUIModel) {
    if (!channel.mainRoom) {
      this.$logger.warn("not fetched main room yet")();
      return 0;
    }
    return channel.mainRoom.id;
  }

  public expandChannel() {
    this.$store.expandChannel(this.channel.id);
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
@import "@/assets/sass/partials/room_users_table"
.router-link-active.active-room
  color: $active-color

.icon-cog
  font-size: 18px
  margin: -2px 0
  float: right
</style>
