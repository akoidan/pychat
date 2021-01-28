<template>
  <div>
    <chat-right-collapsed-section
      v-for="channel in channels"
      :key="channel.id"
      :value="channel.expanded"
      @input="expandChannel(channel.id)"
    >
      <template v-slot:name>
        <router-link
          :to="`/chat/${mainRoomId(channel)}`"
          class="active-room"
        >
          {{ channel.name }}
        </router-link>
      </template>
      <template v-slot:right>
        <router-link :to="`/channel/${channel.id}/settings`">
          <span class="icon-cog" />
        </router-link>
      </template>
      <room-users-public
        v-for="room in channel.rooms"
        :key="room.id"
        :room="room"
      />
    </chat-right-collapsed-section>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  import {State} from '@/ts/instances/storeInstance';
  import {ChannelUIModel} from '@/ts/types/model';
  import ChatRightCollapsedSection
    from '@/vue/chat/right/ChatRightCollapsedSection.vue';
  import RoomUsersPublic from '@/vue/chat/right/RoomUsersPublic.vue';

  @Component({
    components: {RoomUsersPublic, ChatRightCollapsedSection}
  })
  export default class ChannelTable extends Vue {
    @State
    public readonly channels!: ChannelUIModel[];


    mainRoomId(channel: ChannelUIModel) {
      if (!channel.mainRoom) {
        this.$logger.warn("not fetched main room yet")();
        return 0;
      }
      return channel.mainRoom.id;
    }
    public expandChannel(id: number) {
      this.$store.expandChannel(id);
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  @import "~@/assets/sass/partials/room_users_table.sass"
  .router-link-active.active-room
    color: $active-color
  .icon-cog
    font-size: 18px
    margin: -2px 0
    float: right
</style>
