<template>
  <form
    v-if="room"
    class="holder"
    @submit.prevent="apply"
  >
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
              :disabled="isMainRoom"
              :required="isPublic"
              class="input"
              maxlength="16"
            >
            <div v-if="!isPublic && roomName">
              By adding name to this room, you'll make it public
            </div>
          </td>
        </tr>
        <tr v-if="isPublic">
          <th>Admin</th>
          <td v-if="canChangeAdmin">
            <pick-user
              v-model="admin"
              :show-invite-users="showInviteUsers"
              :users-ids="userIds"
            />
          </td>
          <td v-else-if="oldAdmin">
            {{oldAdmin.user}}
          </td>
          <td v-else>
            This room doesn't have an admin
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
        <tr v-if="!isPublic">
          <th>
            Peer to peer
          </th>
          <td>
            <app-checkbox v-model="p2p" />
          </td>
        </tr>
        <tr v-if="isPublic && !isMainRoom">
          <th>Parent channel</th>
          <td>
            <parent-channel v-model="channelId"/>
          </td>
        </tr>
        <tr v-if="!isMainRoom">
          <td colspan="2">
            <app-submit
              type="button"
              class="red-btn"
              value="LEAVE THIS ROOM"
              :running="running"
              @click.native="leave"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              value="APPLY SETTINGS"
              class="green-btn"
              :running="running"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </form>
  <div v-else>
    Room #{{ roomId }} doesn't exist
  </div>
</template>
<script lang="ts">
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';
import {Component, Vue} from 'vue-property-decorator';
import AppInputRange from '@/vue/ui/AppInputRange.vue';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import AppCheckbox from '@/vue/ui/AppCheckbox.vue';
import {CurrentUserInfoModel, RoomDictModel, RoomModel, UserDictModel, UserModel} from '@/ts/types/model';
import {ALL_ROOM_ID} from '@/ts/utils/consts';
import ParentChannel from '@/vue/pages/parts/ParentChannel.vue';
import PickUser from '@/vue/pages/parts/PickUser.vue';

@Component({components: {
    PickUser,
    ParentChannel,
    AppInputRange,
    AppSubmit,
    AppCheckbox
}})
export default class RoomSettings extends Vue {

  get room(): RoomModel {
    return this.roomsDict[this.roomId];
  }

  public admin: number[] = [];

  get roomId(): number {
    const id = this.$route.params.id;
    this.$logger.log('Rending room settings for {}', id)();

    return parseInt(id);
  }

  public roomName: string = '';
  public sound: number = 0;
  public channelId: number|null = null;
  public notifications: boolean = false;
  public running: boolean = false;
  public isPublic: boolean = false;
  public p2p: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly roomsDict!: RoomDictModel;

  @State
  public readonly allUsersDict!: UserDictModel;

  @ApplyGrowlErr({runningProp: 'running'})
  public async leave() {
    this.$logger.log('Leaving room {}', this.roomId)();
    await this.$ws.sendLeaveRoom(this.roomId);
    this.$router.replace(`/chat/${ALL_ROOM_ID}`);
  }

  get showInviteUsers() {
    return  this.admin.length < 1;
  }

  public created() {
    this.setVars();
  }

  get canChangeAdmin() {
    return this.isPublic && (!this.room.creator || this.userInfo.userId === this.room.creator);
  }

  get userIds(): number[] {
    return [...this.room.users];
  }

  get oldAdmin(): UserModel|null {
    if (this.room.creator) {
      return this.allUsersDict[this.room.creator];
    } else {
      return null;
    }
  }

  get isMainRoom(): boolean {
    return this.roomId === ALL_ROOM_ID;
  }

  get singleAdmin(): number {
    if (this.admin.length > 0) {
      return this.admin[0];
    } else {
      return this.room.creator;
    }
  }

  @ApplyGrowlErr({runningProp: 'running', message: `Can't set room settings`})
  public async apply() {
    this.$logger.log('Applying room {} settings', this.roomId)();
    await this.$ws.sendRoomSettings({
      roomCreatorId: this.singleAdmin,
      volume: this.sound,
      notifications: this.notifications,
      name: this.roomName,
      roomId: this.roomId,
      p2p: this.p2p,
      channelId: this.channelId
    });
    this.$store.growlSuccess('Settings has been saved');
    this.$router.replace(`/chat/${this.roomId}`);
  }

  private setVars() {
    this.$logger.log('Updated for room settings {} ', this.room)();
    if (this.room) {
      this.roomName = this.room.name;
      this.isPublic = !!this.roomName;
      this.sound = this.room.volume;
      this.notifications = this.room.notifications;
      this.p2p = this.room.p2p;
      this.channelId = this.room.channelId;
      if (this.room.creator) {
        this.admin = [this.room.creator];
      } else {
        this.admin = []
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"

  .holder
    overflow-y: auto
    display: flex
    justify-content: center
    align-items: center

  input[type=text]
    width: 150px

  th
    text-align: right
  th, td
    padding: 5px
  td
    text-align: center
    > *
      margin: auto
    &[colspan="2"] > *
      width: 100%

</style>
