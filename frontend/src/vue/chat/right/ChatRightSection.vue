<template>
  <div class="chat-room-users-wrapper">
    <room-direct-users-table />
    <room-public-table />
    <channel-table />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import RoomDirectUsersTable from '@/vue/chat/right/RoomDirectUsersTable.vue';
import RoomPublicTable from '@/vue/chat/right/RoomPublicTable.vue';
import ChannelTable from '@/vue/chat/right/ChannelTable.vue';

@Component({
  components: {
    ChannelTable,
    RoomPublicTable,
    RoomDirectUsersTable
  }
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
    overflow-y: scroll
    overflow-x: hidden
    position: relative
    min-width: 300px
    @media screen and (max-width: $collapse-width)
      width: 100%
      min-width: 200px

  .color-white .chat-room-users-wrapper /deep/
    color: $color-white-main


</style>
