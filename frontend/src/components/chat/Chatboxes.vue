<template>
  <div v-show="!dim" class="chatBoxHolder" @drop.prevent="dropPhoto">
    <template v-for="room in roomsArray">
      <chat-box
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
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import ChatBox from '@/components/chat/ChatBox.vue';
  import {State} from '@/utils/storeHolder';

  import {ALL_ROOM_ID} from '@/utils/consts';

  import {RoomModel} from '@/types/model';
  import {messageBus} from '@/utils/singletons';
  @Component({
    components: {ChatBox}
  })
  export default class Chatboxes extends Vue {


    @State
    public readonly dim!: boolean;

    @State
    public readonly roomsArray!: RoomModel[];

    get ALL_ROOM_ID(): number {
      return ALL_ROOM_ID;
    }

    dropPhoto(evt: DragEvent) {
      const files: FileList = (evt.dataTransfer?.files) as FileList;
      this.$logger.debug('Drop photo {} ', files)();
      if (files) {
        messageBus.$emit('drop-photo', files);
      }
    }

    @State
    public readonly activeRoom!: RoomModel;

    @State
    public readonly activeRoomId!: number;
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"


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
