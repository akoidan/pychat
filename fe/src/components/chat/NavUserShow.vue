<template>
  <nav>
    <router-link :to="`/user/${activeUser.id}`">
      <i class="icon-user"> <span
          class="activeUserName">{{activeUser.user}}</span><span class="mText">Profile</span></i>
    </router-link>

    <template v-if="oppositeRoomId">
      <router-link :to="`/chat/${oppositeRoomId}`" >
        <i class="icon-comment"><span class="mText">Write message</span></i>
      </router-link>

      <i class="icon-phone-circled" onclick="channelsHandler.m2Call()"><span class="mText">Call</span></i>
      <i class="icon-doc-inv" onclick="channelsHandler.m2TransferFile()"><span class="mText">Transfer file</span></i>
    </template>
    <template v-else>
      <i class="icon-comment" @click="writeMessage"><span class="mText">Write message</span></i>
    </template>
    <div class="right">
      <app-spinner-small v-if="running" :text="running"/>
      <i class="icon-cancel" @click.stop="closeActiveUser"><span class="mText">Close</span></i>
    </div>
  </nav>
</template>
<script lang="ts">
  import {Getter, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {UserModel} from "../../types/model";
  import {PrivateRoomsIds} from '../../types/types';
  import {AddRoomMessage} from '../../types/messages';
  import AppSpinner from '../ui/AppSpinner';
  import AppSpinnerSmall from '../ui/AppSpinnerSmall';
  @Component({
    components: {AppSpinnerSmall, AppSpinner}
  })
  export default class NavUserShow extends Vue {
    @Mutation setActiveUserId: SingleParamCB<number>;
    @Prop() activeUser: UserModel;
    @Prop() privateRooms: UserModel;
    running: string = null;
    @Getter privateRoomsUsersIds: PrivateRoomsIds;

    get oppositeRoomId() {
      return this.privateRoomsUsersIds.userRooms[this.activeUser.id];
    }

    writeMessage() {
      if (!this.running) {
        this.running = 'Creating room...';
        this.$ws.sendAddRoom(null, 50, true, [this.activeUser.id], (e: AddRoomMessage)=> {
          if (e && e.roomId) {
            this.$router.replace(`/chat/${e.roomId}`);
          }
          this.setActiveUserId(null);
          this.running = null;
        });
      }
    }


    closeActiveUser() {
      this.setActiveUserId(null);
    }

  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"
  @import "partials/mixins"

  .activeUserName
    font-weight: bold

  nav
    @extend %nav
    > *
      cursor: pointer

  .right
    display: flex
    margin-left: auto

  @media screen and (max-width: $collapse-width)
    .right
      margin: 0

  .color-reg
    .icon-cancel
      @include hover-click($red-cancel-reg)
    .icon-phone-circled
      @include hover-click(#33b334)
    .icon-doc-inv
      @include hover-click(#15dfff)
    .icon-comment
      @include hover-click(#8D28DE)
    .icon-quote-left
      @include hover-click(#67C8B0)
    .icon-user
      @include hover-click(#B7D710)
  .color-lor
    .icon-comment
      color: rgb(85, 26, 139)
    .icon-doc-inv
      color: #40b2b2
    .icon-user
      color: rgb(70, 133, 117)
    .icon-quote-left
      color: #c58446
    .icon-phone-circled
      color: #509750
    .icon-cancel
      color: $red-cancel-lor


</style>