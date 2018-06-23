<template>
  <div class="holder">
    <table>
      <tbody>
      <tr v-if="isPublic">
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
            <div>
              <span class="spann" v-for="currentUser in currentUsers">{{ currentUser.user }}
                <i @click="removeUser(currentUser)" class="icon-cancel"></i>
              </span>
            </div>
            <template v-if="showInviteUsers">
              <div>{{inviteUsers}}</div>
              <input type="search" class="input" placeholder="Search" v-model="search" title="Filter by username"/>


              <ul>
                <li v-for="user in filteredUsers" @click="addUser(user)"> {{user.user}}</li>
              </ul>
            </template>

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
  import {CurrentUserInfoModel, UserModel} from "../../types/model";
  import {AddRoomMessage} from "../../utils/messages";

  @Component({components: {AppInputRange, AppSubmit}})
  export default class CreatePrivateRoom extends Vue {
    @Getter usersArray;
    @State userInfo: CurrentUserInfoModel;
    @Action growlError;
    @Getter privateRooms: { [id: string]: UserModel };
    currentUsers: UserModel[] = [];
    notifications: boolean = false;
    sound: number = 0;
    search: string = '';
    roomName: string = '';
    running: boolean = false;

    @Prop() isPublic: boolean;

    get inviteUsers(): string {
      return this.isPublic ? "Invite users" : "Select user";
    }

    get showInviteUsers() {
      return this.users.length > 0 && (this.isPublic || this.currentUsers.length !== 1)
    }

    removeUser(currentUser: UserModel) {
      this.currentUsers.splice(this.currentUsers.indexOf(currentUser), 1);
    }

    addUser(user: UserModel) {
      this.search = '';
      this.currentUsers.push(user);
    }

    add() {
      if (this.isPublic && !this.roomName) {
        this.growlError('Please specify room name');
      } else if (!this.isPublic && this.currentUsers.length === 0) {
        this.growlError('Please add user');
      } else {
        this.running = true;
        this.ws.sendAddRoom(this.roomName ? this.roomName : null, this.sound, this.notifications, this.currentUsers.map(u => u.id), (e: AddRoomMessage)=> {
          if (e && e.roomId) {
            this.$router.replace(`/chat/${e.roomId}`);
          }
          this.running = false;
        });
      }
    }

    get users(): UserModel[] {
      let uids: number[] = this.currentUsers.map(a => a.id);
      uids.push(this.userInfo.userId);
      if (!this.isPublic) {
        for (let user in this.privateRooms) {
          uids.push(this.privateRooms[user].id)
        }
      }
      let users: UserModel[] = [];
      this.usersArray.forEach(u => {
        if (uids.indexOf(u.id) < 0) {
          users.push(u);
        }
      });
      this.logger.debug("Reeval users in CreatePrivateRoom")();
      return users;
    }

    get filteredUsers(): UserModel[] {
      this.logger.debug("Reeval filter CreatePrivateRoom")();
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
    min-height: 50px
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