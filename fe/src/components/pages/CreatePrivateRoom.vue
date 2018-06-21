<template>
  <div class="holder">
    <table>
      <tbody>
      <tr><td colspan="2">
        <div>Leave name empty for private room</div>
      </td></tr>
      <tr>
        <th>
          Name
        </th>
        <td>
          <input type="text" class="input" v-model="roomName" maxlength="16">
        </td>
      </tr>
      <tr>
        <th>
          Notifications
        </th>
        <td>
          <input v-model="notifications" type="checkbox" id="createPrivateRoomCheckbox">
          <label for="createPrivateRoomCheckbox"></label>
        </td>
      </tr>
      <tr>
        <th>
          Sound
        </th>
        <td>
          <app-input-range min="0" max="3" v-model="sound"/>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="controls">
            <div>Invite users</div>
            <input type="search" class="input" placeholder="Search" v-model="search" title="Filter by username"/>
            <div v-if="currentUsers.length">
              <span class="spann" v-for="currentUser in currentUsers">{{ currentUser.user }}
                <i @click="removeUser(currentUser)" class="icon-cancel"></i>
              </span>
            </div>
            <ul>
              <li v-for="user in filteredUsers" @click="addUser(user)"> {{user.user}}</li>
            </ul>

            <app-submit type="button" @click.native="add" value="Create Room" class="green-btn" :running="running"/>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppInputRange from '../ui/AppInputRange';
  import AppSubmit from '../ui/AppSubmit';
  import {UserModel} from '../../model';
  import {UserModelId} from '../../types';
  import {api, globalLogger, ws} from "../../utils/singletons";

  @Component({components: {AppInputRange, AppSubmit}})
  export default class CreatePrivateRoom extends Vue {
    @State allUsers;
    @State rooms;
    @Action growlError;
    @Getter privateRooms: { [id: string]: UserModelId };
    currentUsers: UserModelId[] = [];
    notifications: boolean = false;
    sound: number = 0;
    search: string = '';
    roomName: string = '';
    running: boolean = false;

    removeUser(currentUser: UserModelId) {
      this.currentUsers.splice(this.currentUsers.indexOf(currentUser), 1);
    }

    addUser(user: UserModelId) {
      this.search = '';
      this.currentUsers.push(user);
    }

    add() {
      if (this.currentUsers.length == 0 && !this.roomName) {
        this.growlError('You should specify room name or at least add one user');
      } else {
        this.running = true;
        ws.sendAddRoom(this.roomName, this.sound, this.notifications, this.currentUsers.map(u => u.id), e => {
          this.running = false;
        });
      }
    }

    get users(): UserModelId[] {
      let uids: number[] = this.currentUsers.map(a => a.id);
      for (let user in this.privateRooms) {
        uids.push(this.privateRooms[user].id)
      }
      let users: UserModelId[] = [];
      for (let uid in this.allUsers) {
        let u: UserModel = this.allUsers[uid];
        if (uids.indexOf(parseInt(uid)) < 0) {
          let c: UserModelId = {
            user: u.user,
            id: parseInt(uid),
            sex: u.sex
          };
          users.push(c);
        }
      }
      globalLogger.debug("Reeval users in CreatePrivateRoom")();
      return users;
    }

    get filteredUsers(): UserModelId[] {
      globalLogger.debug("Reeval filter CreatePrivateRoom")();
      let s = this.search.toLowerCase();
      return this.users.filter(u => u.user.toLowerCase().indexOf(s) >= 0);
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"

  .icon-cancel
    cursor: pointer

  .spann
    @extend %hovered-user-room


  input[type="text"]
    max-width: calc(100vw - 140px)

  .color-reg .icon-cancel
      @include hover-click($red-cancel-reg)
  .color-lor .icon-cancel
    color: #a94442
  .holder
    display: flex
    justify-content: center
    padding-top: 20px
  .controls
    display: flex
    flex-direction: column
    > *
      margin-top: 10px
  th, td
    padding: 5px

  .green-btn
    width: 100%

  ul
    max-height: calc(100vh - 400px)
    min-height: 30px
    overflow-y: scroll
    padding-left: 0

  li
    padding: 0 0 0 5px
    border-radius: 2px
    text-overflow: ellipsis
    overflow: hidden
    max-width: 250px
    white-space: nowrap
    @extend %hovered-user-room
  input[type=checkbox]
    @extend %checkbox
</style>