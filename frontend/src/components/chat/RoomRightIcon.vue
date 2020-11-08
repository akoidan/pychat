<template>
  <div class="right-div">
    <router-link :to="`/room-settings/${room.id}`">
      <span
        v-if="!room.newMessagesCount"
        class="icon-cog"
      />
    </router-link>
    <span
      v-if="room.newMessagesCount"
      class="newMessagesCount"
      :title="`You have ${room.newMessagesCount} new messages in this room`"
    >
      {{ room.newMessagesCount }}
    </span>
<!--    TODO does icon-phone work-->
    <span
      v-else-if="room.callInfo.callActive"
      class="icon-phone icon-no-cog"
    />
    <template v-else-if="room.p2p">
      <span
        v-if="room.p2pInfo.amountOfActiveConnections > 0"
        :title="`This room has opened ${room.p2pInfo.amountOfActiveConnections} connection with other devices`"
        class="icon-spin1 icon-no-cog"
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
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {RoomModel} from '@/types/model';

  @Component
  export default class RoomRightIcon extends Vue {

    @Prop() public room!: RoomModel;

  }
</script>
<!-- eslint-disable -->
<style
    lang="sass"
    scoped
>

  .right-div
    display: flex

  /*.icon-cog*/
  /*  z-index: 22 // otherwise cog won't be clickable, becase we wrapped it in a div, that has 0x0 width height*/
</style>
