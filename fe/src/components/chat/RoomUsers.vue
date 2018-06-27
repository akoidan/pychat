<template>
  <div class="chat-room-users-wrapper">
      <span>
        <span name="direct" :class="directClass" @click="directMinified = !directMinified"></span>
        <span class="directStateText">direct  messages</span>
        <router-link to="/create-private-room" class="icon-plus-squared" title="Create direct room"/>
      </span>
    <ul class="directUserTable" v-show="!directMinified">
      <li :class="getOnlineActiveClass(user.id, parseInt(id))" :key="id" v-for="(user, id) in privateRooms">
        <router-link :to="`/chat/${id}`">
          <i :class="getUserSexClass(user)"></i>{{user.user}}
        </router-link>
        <router-link :to="`/room-settings/${id}`">
          <span class="icon-cog"></span>
        </router-link>
        <span class="newMessagesCount"></span>
      </li>
    </ul>
    <span>
        <span name="channel" :class="roomsClass" @click="roomsMinified = !roomsMinified"></span>
        <span class="channelsStateText">rooms</span>
        <router-link to="/create-public-room" class="icon-plus-squared" title="Create public room"/>
    </span>
    <ul class="rooms" v-show="!roomsMinified">
      <li v-for="room in publicRooms" :key="room.id" :class="getActiveClass(room.id)">
        <router-link :to="`/chat/${room.id}`">
          {{ room.name }}
        </router-link>
        <router-link :to="`/room-settings/${room.id}`">
          <span class="icon-cog"></span>
        </router-link>
        <span class="newMessagesCount"></span>
      </li>
    </ul>
    <span>
        <span name="user" :class="onlineClass" @click="onlineMinified = !onlineMinified"></span>
        <span class="usersStateText" @click="onlineShowOnlyOnline = !onlineShowOnlyOnline">{{onlineText}}</span>
        <router-link :to="`/invite-user/${activeRoomId}`" class="icon-user-plus" title="Add user to current active channel"/>
      </span>
    <ul class="chat-user-table" v-show="!onlineMinified">
      <template v-for="user in usersArray">
        <li :class="getOnlineClass(user.id)" v-show="userIsInActiveRoom(user.id)" :key="user.id">
          <i :class="getUserSexClass(user)"></i>{{ user.user }}
        </li>
      </template>
    </ul>
  </div>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import {Component, Vue} from "vue-property-decorator";
  import {RoomModel, SexModel, UserDictModel, UserModel} from "../../types/model";


  @Component
  export default class RoomUsers extends Vue {

    @Getter usersArray: UserDictModel;
    @State activeRoomId: number;
    @Getter activeRoom: RoomModel;
    @State online: number[];
    @Getter publicRooms: RoomModel[];
    @Getter privateRooms: { [id: string]: UserModel};

    directMinified: boolean = false;
    roomsMinified: boolean = false;
    onlineMinified: boolean = false;
    onlineShowOnlyOnline: boolean = false;

    getUserSexClass(user: UserModel) {
      if (user.sex === SexModel.Male) {
        return 'icon-man';
      } else if (user.sex === SexModel.Female) {
        return 'icon-girl';
      } else if (user.sex === SexModel.Secret) {
        return 'icon-user-secret';
      } else {
        throw `Invalid sex ${user.sex}`;
      }
    }

    userIsInActiveRoom(userId: number) {
      let ar = this.activeRoom;
      return ar && ar.users.indexOf(userId) >= 0;
    }

    getOnlineClass(id: number) : string {
      return this.online.indexOf(id) < 0 ? 'offline' : 'online';
    }

    getActiveClass(roomId: number) {
      return roomId === this.activeRoomId ? 'active-room' : null;
    }

    getOnlineActiveClass(id: number, roomId: number) : string[] {
      const a = [this.online.indexOf(id) < 0 ? "offline" : "online"];
      if (roomId === this.activeRoomId) {
        a.push('active-room');
      }
      return a;
    }

    updated() {
      this.logger.debug("updating ")();
    }

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

  @import "partials/variables"
  @import "partials/mixins"
  @import "partials/abstract_classes"

  .icon-cog
    cursor: pointer

  li:not(.active-room)
    @extend %hovered-user-room
  a
    display: flex
    flex-grow: 1

  @mixin fix-user-icon-top-position()
    i:before
      transform: translate(0, 3px)

  .chat-user-table, .directUserTable
    display: flex
    flex-direction: column
    .online
      order: 1
    .offline
      order: 2

  .chat-user-table
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

  .chat-room-users-wrapper
    float: right
    font-size: 24px
    overflow-y: auto
    overflow-x: hidden
    position: relative
    width: 300px
    ul
      margin-top: 5px
      margin-bottom: 5px
      padding-left: 0

    .channelsStateText, .directStateText, .usersStateText
      font-size: 13px
      font-weight: bold
      text-transform: uppercase
      vertical-align: middle

    .icon-angle-circled-down, .icon-angle-circled-up
      font-size: 15px

    .icon-plus-squared, .icon-user-plus
      float: right
      margin-top: 7px
      margin-right: 5px

    > span
      @extend %user-select-none
      border-radius: 2px

    .usersStateText:hover
      cursor: pointer
      color: #f1f1f1


  .color-lor
    .icon-cog
      color: #59b2c1
    .active-room
      background-color: #375a70
    .chat-user-table li
      &.offline:before
        color: #a93331
      &:before
        color: #2e9154
    .chat-room-users-wrapper
      @media screen and (max-width: $collapse-width)
        border-bottom-color: $color-lor-scroll
      > span
        background-color: #221f1f
        color: #8f8f8f
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #2e9154
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #c53432
  .chat-room-users-wrapper > span
    display: block

  .color-reg
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
    .chat-room-users-wrapper
      .icon-smile, .icon-picture, .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
        @include hover-click(#e3e3e3)
      @media screen and (max-width: $collapse-width)
        border-bottom-color: $mostly-black
      > span
        background-color: #171717

  .color-white
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
    .chat-room-users-wrapper
      color: $color-white-main
      @media screen and (max-width: $collapse-width)
        border-bottom: 2px solid grey
      > span
        background-color: #414141
        color: white

  @media screen and (max-width: $collapse-width)
    .chat-room-users-wrapper
      width: 100%
      border-bottom: 8px solid
      @include flex(1)
      flex-grow: 2

  .icon-smile, .icon-picture, .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
    cursor: pointer
    font-size: 15px


  .directUserTable, .rooms
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

  .rooms li
    padding-left: 7px


  .rooms, .directUserTable, .chat-user-table > ul
    $padding: 2px
    margin-left: $padding
    margin-right: $padding

    .icon-cog
      display: none
      position: absolute
      top: 2px
      right: 0
      background: transparent

</style>