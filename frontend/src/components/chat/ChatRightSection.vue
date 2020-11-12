<template>
  <div class="chat-room-users-wrapper">
    <room-direct-users-table />
    <room-public-table />
    <current-room-users-table />
  </div>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import RoomDirectUsersTable from '@/components/chat/RoomDirectUsersTable';
import RoomPublicTable from '@/components/chat/RoomPublicTable';
import CurrentRoomUsersTable from '@/components/chat/CurrentRoomUsersTable';

@Component({
  components: {CurrentRoomUsersTable, RoomPublicTable, RoomDirectUsersTable}
})
export default class ChatRightSection extends Vue {

}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"

  .chat-room-users-wrapper
    float: right
    font-size: 24px
    overflow-y: auto
    overflow-x: hidden
    position: relative
    width: 300px
    @media screen and (max-width: $collapse-width)
      width: 100%
      border-bottom: 8px solid
      max-height: 50%

  .color-lor .chat-room-users-wrapper /deep/
    @media screen and (max-width: $collapse-width)
      border-bottom-color: $color-lor-scroll

  .color-reg .chat-room-users-wrapper /deep/
    @media screen and (max-width: $collapse-width)
      border-bottom-color: $mostly-black

  .color-white .chat-room-users-wrapper /deep/
    color: $color-white-main
    @media screen and (max-width: $collapse-width)
      border-bottom: 2px solid grey


</style>
