<template>
  <div>
    <span
      v-if="newMessagesCount > 0"
      :title="`You have ${newMessagesCount} new messages in this room`"
      class="newMessagesCount"
    >
      {{ newMessagesCount }}
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
        class="icon-wifi icon-no-cog"
        title="This room is secure. When you send a message a direct connection will be established and maintained with the enduser"
      />
    </template>
  </div>
</template>
<script lang="ts">
import {MessageStatus} from "@common/model/enum/message.status";


import {Component, Prop, Vue} from "vue-property-decorator";
import type {MessageModel} from "@/ts/types/model";
import {RoomModel} from "@/ts/types/model";


@Component({name: "RoomRightIcon"})
export default class RoomRightIcon extends Vue {
  @Prop() public room!: RoomModel;

  public get newMessagesCount(): number {
    return this.$store.calculatedMessagesForRoom(this.room.id).filter((m: MessageModel) =>

      /*
       * On_server is not really required, since all received messages are gonna be 'received'
       * But it's an additional failsafe check, in case of a bug in another place
       */
      (m.status === MessageStatus.RECEIVED || m.status === MessageStatus.ON_SERVER) &&
      m.userId !== this.$store.myId).length;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/room_users_table"

.icon-phone
  @include hover-click(#3aa130)

.icon-wifi
  @include hover-click(#c72727)

.icon-wifi, .icon-phone, .icon-spin1
  @extend %right-icon

.icon-spin1
  padding: 0px
  //overrite @extend %right-icon padding-right 2px
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
