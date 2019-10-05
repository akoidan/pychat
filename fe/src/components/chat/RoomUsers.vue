<template>
  <div class="chat-room-users-wrapper">
      <span>
        <span name="direct" :class="directClass" @click="directMinified = !directMinified"></span>
        <span class="directStateText">direct  messages</span>
        <router-link to="/create-private-room" class="icon-plus-squared" title="Create direct room"/>
      </span>
    <ul class="directUserTable" v-show="!directMinified">
      <room-users-private :key="room.id" v-for="room in privateRooms" :room="room"/>
    </ul>
    <span>
        <span name="channel" :class="roomsClass" @click="roomsMinified = !roomsMinified"></span>
        <span class="channelsStateText">rooms</span>
        <router-link to="/create-public-room" class="icon-plus-squared" title="Create public room"/>
    </span>
    <ul class="rooms" v-show="!roomsMinified">
      <room-users-public v-for="room in publicRooms" :key="room.id" :room="room"/>
    </ul>
    <span>
        <span name="user" :class="onlineClass" @click="onlineMinified = !onlineMinified"></span>
        <span class="usersStateText" @click="onlineShowOnlyOnline = !onlineShowOnlyOnline">{{onlineText}}</span>
        <router-link :to="`/invite-user/${activeRoomId}`" class="icon-user-plus" title="Add user to current active channel"/>
      </span>
    <ul class="chat-user-table" v-show="!onlineMinified">
      <room-users-user v-for="user in usersArray" :user="user" :key="user.id"></room-users-user>
    </ul>
  </div>
</template>
<script lang="ts">
  import {store} from '@/utils/storeHolder';
  import {Component, Vue} from "vue-property-decorator";
  import {RoomModel, SexModel, UserDictModel, UserModel} from "@/types/model";
  import RoomUsersUser from '@/components/chat/RoomUsersUser';
  import RoomUsersPublic from '@/components/chat/RoomUsersPublic';
  import RoomUsersPrivate from '@/components/chat/RoomUsersPrivate';
  @Component({
    components: {RoomUsersPrivate, RoomUsersPublic, RoomUsersUser}
  })
  export default class RoomUsers extends Vue {

    get usersArray(): UserModel[]  { return store.usersArray };
    get activeRoomId(): number  { return store.activeRoomId }
    get publicRooms(): RoomModel[]  { return store.publicRooms };
    get privateRooms(): RoomModel[]  { return store.privateRooms };

    directMinified: boolean = false;
    roomsMinified: boolean = false;
    onlineMinified: boolean = false;
    onlineShowOnlyOnline: boolean = false;


    get onlineText() {
      return this.onlineShowOnlyOnline ? 'Room Users' : 'Room Online'
    }

    get directClass() {
      return this.directMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down'
    }
    get roomsClass() {
      return this.roomsMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down'
    }
    get onlineClass() {
      return this.onlineMinified ? 'icon-angle-circled-up' : 'icon-angle-circled-down'
    }

  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"

  @mixin fix-user-icon-top-position()
    i:before
      transform: translate(0, 3px)

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
      @include flex(1)
      flex-grow: 2

    /deep/
      .icon-smile, .icon-picture, .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
        cursor: pointer
        font-size: 15px


    /deep/ .directUserTable, /deep/ .rooms
      li
        @include  fix-user-icon-top-position
        @include ellipsis
        border-radius: 3px
        position: relative
        height: 30px
        &:hover
          padding-right: 25px
          .icon-cog
            display: inline

    /deep/ .rooms li
      padding-left: 7px


    /deep/ .rooms, /deep/ .directUserTable, /deep/  .chat-user-table > ul
      $padding: 2px
      margin-left: $padding
      margin-right: $padding

      .icon-cog
        display: none
        position: absolute
        top: 2px
        right: 0
        background: transparent

    /deep/ .newMessagesCount
      color: white
      border-radius: 5px
      display: inline-block
      padding: 2px 10px 2px 10px
      right: 10px
      top: 5px
      font-size: 12px
      position: absolute
    /deep/ ul
      margin-top: 5px
      margin-bottom: 5px
      padding-left: 0

    /deep/.channelsStateText, /deep/ .directStateText, /deep/ .usersStateText
      font-size: 13px
      font-weight: bold
      text-transform: uppercase
      vertical-align: middle

    /deep/ .icon-angle-circled-down, /deep/ .icon-angle-circled-up
      font-size: 15px

    /deep/ .icon-plus-squared, /deep/ .icon-user-plus
      float: right
      margin-top: 7px
      margin-right: 5px

    > span
      @extend %user-select-none
      border-radius: 2px

    /deep/ .usersStateText:hover
      cursor: pointer
      color: #f1f1f1

    /deep/ .icon-cog
      cursor: pointer

    /deep/ li:not(.active-room)
      @extend %hovered-user-room
    /deep/ a
      display: flex
      flex-grow: 1

    /deep/ .chat-user-table, /deep/  .directUserTable
      display: flex
      flex-direction: column
      .online
        order: 1
      .offline
        order: 2

    /deep/ .chat-user-table
      margin: 5px 0
      li
        border: 1px solid transparent
        width: 100%
        @include ellipsis
        border-radius: 3px
        [class^='icon-']
          opacity: 1
        @include fix-user-icon-top-position
        i:hover
          cursor: inherit

      &.hideOffline li
        &.offline
          display: none


  .color-lor .chat-room-users-wrapper /deep/
    @media screen and (max-width: $collapse-width)
      border-bottom-color: $color-lor-scroll
      > span
        background-color: #221f1f
        color: #8f8f8f
    .icon-cog
      color: #59b2c1
    .active-room
      background-color: #375a70
    .chat-user-table li
      &.offline:before
        color: #a93331
      &:before
        color: #2e9154
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #2e9154
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #c53432
    > span
      background-color: #221f1f
  .chat-room-users-wrapper > span
    display: block

  .color-reg .chat-room-users-wrapper /deep/
    .newMessagesCount
      background-color: #891313
    a
      color: $color-lor-main
    .icon-cog
      @include hover-click(#59b2c1)
    .active-room
      background-color: rgba(33, 158, 147, 0.45)
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #b32c1c
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #1f772c
    .chat-user-table li
      &.offline:before
        color: #801615
      &:before
        color: #28671d
    .icon-smile, .icon-picture, .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
        @include hover-click(#e3e3e3)
    @media screen and (max-width: $collapse-width)
      border-bottom-color: $mostly-black
    > span
      background-color: #171717

  .color-white .chat-room-users-wrapper /deep/
    color: $color-white-main
    @media screen and (max-width: $collapse-width)
      border-bottom: 2px solid grey
    > span
      background-color: #414141
      color: white
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #fa9d9b
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #78f584
    a
      color: $color-white-main
    .icon-cog
      color: #59b2c1
    .active-room
      background-color: #656888
    .directUserTable, .chat-user-table ul
      .offline
        .icon-user-secret, .icon-man, .icon-girl
          color: #fa9d9b
      .online
        .icon-user-secret, .icon-man, .icon-girl
          color: #90e690
    .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
      color: #cccccc



</style>
