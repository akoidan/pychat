<template>
  <div>
    <span
      v-if="room.newMessagesCount"
      class="newMessagesCount"
      :title="`You have ${room.newMessagesCount} new messages in this room`"
    >
      {{ room.newMessagesCount }}
    </span>
    <span
      v-else-if="room.callInfo.callActive"
      class="icon-phone icon-no-cog"
    />
    <template v-else-if="room.p2p">
      <span
        v-if="room.p2pInfo.liveConnections.length > 0"
        :title="`This room has opened ${room.p2pInfo.liveConnections} connection with other devices`"
        class="icon-spin1 icon-no-cog animate-spin"
      />
      <span
        v-else
        title="This room is secure. When you send a message a direct connection will be established and maintained with the enduser"
        class="icon-wifi icon-no-cog"
      />
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { RoomModel } from '@/ts/types/model';

@Component
  export default class RoomRightIcon extends Vue {

    @Prop() public room!: RoomModel;

  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins.sass"
  @import "~@/assets/sass/partials/room_users_table.sass"

  .icon-phone
    @include hover-click(#3aa130)
  .icon-wifi
    @include hover-click(#c72727)

  .icon-wifi, .icon-phone, .icon-spin1
    @extend %right-icon

  .icon-spin1
    padding: 0px //overrite @extend %right-icon padding-right 2px
    color: #53a045
  .icon-cog
    @extend %icon-cog

  .newMessagesCount
    color: white
    border-radius: 5px
    display: inline-block
    padding: 2px 10px 2px 10px
    right: 10px
    top: 5px
    font-size: 12px
    position: absolute
  .color-reg .newMessagesCount
    background-color: #891313

  /*.icon-cog*/
  /*  z-index: 22 // otherwise cog won't be clickable, becase we wrapped it in a div, that has 0x0 width height*/
</style>
