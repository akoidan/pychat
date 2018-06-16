<template>
  <div class="chat-room-users-wrapper">
      <span>
        <span name="direct" :class="directClass" @click="directMinified = !directMinified"></span>
        <span class="directStateText">direct  messages</span>
        <i class="icon-plus-squared" title="Create New Direct Channel"
           @click="showAddUser"></i></span>
    <ul class="directUserTable" v-show="!directMinified">
      <li :class="getOnlineClass(user.id)" v-for="user in privateRooms">
        <i :class="getUserSexClass(user)"></i>{{user.user}}
        <span class="icon-cog"></span>
        <span class="newMessagesCount"></span>
      </li>
    </ul>
    <span>
        <span name="channel" :class="roomsClass" @click="roomsMinified = !roomsMinified"></span>
        <span class="channelsStateText">rooms</span>
        <i class="icon-plus-squared" title="Create New Room" @click="showAddRoom"></i></span>
    <ul class="rooms" v-show="!roomsMinified">
      <li v-for="room in publicRooms">{{ room.name }}
        <span class="icon-cog"></span>
        <span class="newMessagesCount"></span>
      </li>
    </ul>
    <span>
        <span name="user" :class="onlineClass" @click="onlineMinified = !onlineMinified"></span>
        <span class="usersStateText" @click="onlineShowOnlyOnline = !onlineShowOnlyOnline">{{onlineText}}</span>
        <i class="icon-user-plus" title="Add user to current active channel"
           @click="showInviteUser"></i>
      </span>
    <ul class="chat-user-table" v-show="!onlineMinified">
      <template v-for="(user, id) in allUsers">
        <li :class="getOnlineClass(parseInt(id))" v-show="userIsInActiveRoom(parseInt(id))">
          <i :class="getUserSexClass(user)"></i>{{ user.user }}
        </li>
      </template>
    </ul>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfo, RoomModel, SexModel, UserModel} from "../../types";
  import {globalLogger} from '../../utils/singletons';


  interface UserModelId extends UserModel {
    id: number
  }

  @Component
  export default class RoomUsers extends Vue {

    @State rooms: {[id: string]: RoomModel};
    @State allUsers: {[id: string]: UserModel};
    @State activeRoomId: number;
    @State userInfo: CurrentUserInfo;
    @State online: number[];

    directMinified: boolean = false;
    roomsMinified: boolean = false;
    onlineMinified: boolean = false;
    onlineShowOnlyOnline: boolean = false;

    getUserSexClass(user: UserModelId) {
      return user.sex === SexModel.MALE? 'icon-man' : user.sex === SexModel.FEMALE  ? 'icon-girl' : 'icon-user-secret'
    }

    userIsInActiveRoom(userId) {
      return this.rooms[this.activeRoomId].users.indexOf(userId) >= 0;
    }

    getOnlineClass(id: number) : string {
      return this.online.indexOf(id) < 0 ? 'offline' : 'online';
    }

    get privateRooms(): { [id: string]: UserModelId } {
      let res =  Object.keys(this.rooms)
          .filter(key => !this.rooms[key].name)
          .reduce((obj, key) => {
            let users = this.rooms[key].users;
            let id = this.userInfo.userId === users[0]? users[1] : users[0];
            return {
              ...obj,
              [key]: {...this.allUsers[id], id}
            };
          }, {}) as { [id: string]: UserModelId };
      globalLogger.log("private rooms {}", res)();
      return res;
    }

    get publicRooms(): { [id: string]: RoomModel } {
      return Object.keys(this.rooms)
          .filter(key => this.rooms[key].name)
          .reduce((obj, key) => {
            return {
              ...obj,
              [key]: this.rooms[key]
            };
          }, {});
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

    showInviteUser() {}
    showAddRoom(){}
    showAddUser() {}
  }
</script>

<style lang="sass" scoped>

  @import "partials/variables"
  @import "partials/mixins"

  %hovered-user-room
    &:hover:not(.active-room)
      cursor: pointer
      background-color:  rgba(135, 135, 135, 0.3)
      opacity: 1
      i
        opacity: inherit

  @mixin fix-user-icon-top-position()
    i:before
      transform: translate(0, 3px)

  .chat-user-table > ul, ul.directUserTable
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
    > *
      display: block

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
    .chat-user-table li
      &.offline:before
        color: #a93331
      &:before
        color: #2e9154
    .chat-room-users-wrapper
      color: $color-lor-main
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

  .color-reg
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
      color: $color-reg-main
      .icon-smile, .icon-picture, .icon-user-plus, .icon-plus-squared, .icon-angle-circled-down, .icon-angle-circled-up
        @include hover-click(#e3e3e3)
      @media screen and (max-width: $collapse-width)
        border-bottom-color: $mostly-black
      > span
        background-color: #171717

  .color-white
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
      @extend %hovered-user-room
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