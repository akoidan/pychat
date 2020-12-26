<template>
  <div class="chat-room-users-wrapper">
    <room-direct-users-table />
    <room-public-table />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import RoomDirectUsersTable from '@/vue/chat/RoomDirectUsersTable.vue';
import RoomPublicTable from '@/vue/chat/RoomPublicTable.vue';

@Component({
  components: {RoomPublicTable, RoomDirectUsersTable}
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
