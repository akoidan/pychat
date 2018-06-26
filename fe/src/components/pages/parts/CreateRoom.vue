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
          <app-checkbox v-model="notifications"/>
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
      </tbody>
    </table>
    <add-user-to-room v-model="currentUsers" :text="inviteUsers" :exclude-users-ids="excludeUsersIds" :showInviteUsers="showInviteUsers"/>
    <app-submit type="button" @click.native="add" value="Create Room" class="green-btn" :running="running"/>
  </div>
</template>
<script lang="ts">
  import {Action, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppInputRange from "../../ui/AppInputRange";
  import AppSubmit from "../../ui/AppSubmit";
  import AddUserToRoom from "./AddUserToRoom.vue";
  import {UserModel} from "../../../types/model";
  import {AddRoomMessage} from "../../../types/messages";
  import AppCheckbox from '../../ui/AppCheckbox';

  @Component({components: {AppCheckbox, AppInputRange, AppSubmit, AddUserToRoom}})
  export default class CreateRoom extends Vue {
    @Action growlError;
    @Getter privateRooms: { [id: string]: UserModel };
    currentUsers: UserModel[] = [];
    notifications: boolean = false;
    sound: number = 0;
    roomName: string = '';
    running: boolean = false;

    @Prop() isPublic: boolean;

    get inviteUsers(): string {
      return this.isPublic ? "Invite users to new room" : "Select user for private room";
    }

    get showInviteUsers() {
      return this.isPublic || this.currentUsers.length < 1;
    }

    get excludeUsersIds() {
      let uids: number[] = [];
      if (!this.isPublic) {
        for (let user in this.privateRooms) {
          uids.push(this.privateRooms[user].id)
        }
      }
      return uids;
    }

    add() {
      if (this.isPublic && !this.roomName) {
        this.growlError('Please specify room name');
      } else if (!this.isPublic && this.currentUsers.length === 0) {
        this.growlError('Please add user');
      } else {
        this.running = true;
        this.$ws.sendAddRoom(this.roomName ? this.roomName : null, this.sound, this.notifications, this.currentUsers.map(u => u.id), (e: AddRoomMessage)=> {
          if (e && e.roomId) {
            this.$router.replace(`/chat/${e.roomId}`);
          }
          this.running = false;
        });
      }
    }

  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"

  input[type="text"]
    max-width: calc(100vw - 140px)

  .holder
    @extend %room-settings-holder

  th, td
    padding: 5px

  .green-btn
    width: 100%
    flex-shrink: 0

</style>