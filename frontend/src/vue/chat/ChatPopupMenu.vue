<template>
  <app-modal>
    <div class="popup-menu">
      <i
        class="icon-search"
        title="Search messages in current room (Shift+Ctrl+F)"
        @click="invertSearch"
      >
        <span class="mText">Search</span>
      </i>
      <i
        class="icon-phone"
        title="Make a video/mic call"
        @click="startCall"
      ><span class="mText">Call</span></i>
      <router-link :to="`/room-users/${activeRoomId}`" v-if="activeRoom.name">
        <i class="icon-user-pair"/> Users
      </router-link>
      <router-link v-if="activeRoom.isMainInChannel" :to="`/channel/${activeRoom.channelId}/room`">
        <i class="icon-plus-squared"/> Add room
      </router-link>
      <router-link v-if="activeRoom.isMainInChannel" :to="`/channel/${activeRoom.channelId}/settings`">
        <i class="icon-cog"/> Settings
      </router-link>
      <router-link v-else :to="`/room-settings/${activeRoomId}`">
        <i class="icon-cog"/> Settings
      </router-link>
    </div>
  </app-modal>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {State} from '@/ts/instances/storeInstance';
  import {RoomModel} from '@/ts/types/model';
  import AppModal from '@/vue/ui/AppModal.vue';

  @Component({
    components: {
      AppModal
    }
  })
  export default class ChatPopupMenu extends Vue {
    @State
    public readonly activeRoomId!: number;

    @State
    public readonly activeRoom!: RoomModel;

    public invertSearch() {
      this.$store.toogleSearch(this.activeRoomId);
    }

    public startCall() {
      this.$webrtcApi.startCall(this.activeRoomId);
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  .popup-menu
    display: flex
    flex-direction: column
    background-color: #252526
    padding: 5px 10px
    font-size: 26px
    border: 1px #696951 solid
    margin-left: auto
    margin-top: 51px
    align-self: flex-start
    > *
      padding: 5px
</style>
