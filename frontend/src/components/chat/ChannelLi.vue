<template>
  <div>
    <li @click="expandChannel(channel.id)" class="channel">
      {{ channel.name }}

      <router-link :to="`/channel-settings/${channel.id}`">
        <span class="icon-cog"/>
      </router-link>
    </li>
    <room-users-public
      class="channel-room"
      v-show="channel.expanded"
      v-for="room in channel.rooms"
      :key="room.id"
      :room="room"
    />
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {ChannelUIModel, RoomModel} from '@/types/model';
  import {State} from '@/utils/storeHolder';
  import RoomUsersPublic from '@/components/chat/RoomUsersPublic.vue';
  @Component({
    components: {RoomUsersPublic}
  })
  export default class ChannelLi extends Vue {

    @Prop() public channel!: ChannelUIModel;

    public expandChannel(id: number) {
      this.store.expandChannel(id);
    }
  }
</script>
<!-- eslint-disable -->
<style
    lang="sass"
    scoped
>
</style>
