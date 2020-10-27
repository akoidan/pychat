<template>
  <div class="holder">
    <table>
      <tbody>
        <tr v-if="isPublic">
          <th>
            Name
          </th>
          <td>
            <input
              v-model="roomName"
              type="text"
              class="input"
              maxlength="16"
            >
          </td>
        </tr>
        <tr>
          <th>Parent channel</th>
          <td>
            <select class="input" v-model="selectedChannelId">
              <option :value="null" selected>W/o channel</option>
              <option
                  v-for="channel in channels"
                  :key="channel.id"
                  :value="channel.id"
              >
                {{ channel.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>
            Notifications
          </th>
          <td>
            <app-checkbox v-model="notifications" />
          </td>
        </tr>
        <tr>
          <th>
            Sound
          </th>
          <td>
            <app-input-range
              v-model="sound"
              min="0"
              max="100"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <add-user-to-room
      v-model="currentUsers"
      :text="inviteUsers"
      :exclude-users-ids="excludeUsersIds"
      :show-invite-users="showInviteUsers"
    />
    <app-submit
      type="button"
      value="Create Room"
      class="green-btn"
      :running="running"
      @click.native="add"
    />
  </div>
</template>
<script lang="ts">
import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue} from 'vue-property-decorator';
import AppInputRange from '@/components/ui/AppInputRange';
import AppSubmit from '@/components/ui/AppSubmit';
import AddUserToRoom from '@/components/pages/parts/AddUserToRoom';
import {
  ChannelUIModel,
  CurrentUserInfoModel,
  RoomModel,
  UserModel
} from '@/types/model';
import {AddRoomMessage} from '@/types/messages';
import AppCheckbox from '@/components/ui/AppCheckbox';
import {PrivateRoomsIds} from '@/types/types';

@Component({components: {AppCheckbox, AppInputRange, AppSubmit, AddUserToRoom}})
export default class CreateRoom extends Vue {

  @State
  public readonly privateRoomsUsersIds!: PrivateRoomsIds;
  @State
  public readonly userInfo!: CurrentUserInfoModel;
  @State
  public readonly channels!: ChannelUIModel[];
  public currentUsers: UserModel[] = [];
  public notifications: boolean = false;
  public sound: number = 0;
  public selectedChannelId: number|null = null;
  public roomName: string = '';
  public running: boolean = false;

  @Prop() public isPublic!: boolean;

  get inviteUsers(): string {
    return this.isPublic ? 'Invite users to new room' : 'Select user for private room';
  }

  get showInviteUsers() {
    return this.isPublic || this.currentUsers.length < 1;
  }

  get excludeUsersIds() {
    let uids: number[];
    if (!this.isPublic) {
      uids = Object.values(this.privateRoomsUsersIds.roomUsers);
    } else {
      uids = [];
    }

    return uids;
  }

  public add() {
    if (this.isPublic && !this.roomName) {
      this.store.growlError('Please specify room name');
    } else if (!this.isPublic && this.currentUsers.length === 0) {
      this.store.growlError('Please add user');
    } else {
      this.running = true;
      this.$ws.sendAddRoom(
          this.roomName ? this.roomName : null,
          this.sound,
          this.notifications,
          this.currentUsers.map(u => u.id),
          this.selectedChannelId,
          (e: AddRoomMessage) => {
            if (e && e.roomId) {
              this.$router.replace(`/chat/${e.roomId}`);
            }
            this.running = false;
          }
      );
    }
  }

}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  input[type="text"]
    max-width: calc(100vw - 140px)

  .holder
    @extend %room-settings-holder

  select
    width: 100%
  th, td
    padding: 5px

  .green-btn
    width: 100%
    flex-shrink: 0

</style>
