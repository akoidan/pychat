<template>
  <form
    v-if="room"
    class="holder"
    @submit.prevent="apply"
  >
    <table>
      <tbody>
        <tr>
          <td v-if="room.name" class="room-heder" colspan="2">
            Room <b>{{ room.name }}</b> settings
          </td>
          <td v-else class="room-heder" colspan="2">
            User <b>{{ user }}</b> settings
          </td>
        </tr>
        <tr v-if="isPublic">
          <th>
            Name
          </th>
          <td>
            <input
              v-model="roomName"
              :disabled="isMainRoom"
              :required="isPublic"
              class="input"
              maxlength="16"
              type="text"
            />
            <div v-if="!isPublic && roomName">
              By adding name to this room, you'll make it public
            </div>
          </td>
        </tr>
        <tr v-if="isPublic && !isMainRoom">
          <th>Admin</th>
          <td v-if="canChangeAdmin">
            <pick-user
              v-model="admin"
              :show-invite-users="showInviteUsers"
              :users-ids="userIds"
            />
          </td>
          <td v-else-if="oldAdmin">
            {{ oldAdmin.user }}
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
            <app-checkbox v-model="notifications"/>
          </td>
        </tr>
        <tr>
          <th>
            Sound
          </th>
          <td>
            <app-input-range
              v-model="sound"
              max="100"
              min="0"
            />
          </td>
        </tr>
        <tr v-if="!isPublic">
          <th>
            Peer to peer
          </th>
          <td>
            <app-checkbox v-model="p2p"/>
          </td>
        </tr>
        <tr v-if="!isMainRoom">
          <td colspan="2">
            <app-submit
              :running="running"
              class="red-btn"
              type="button"
              value="LEAVE THIS ROOM"
              @click.native="leaveRoom"
            />
          </td>
        </tr>
        <tr v-if="isAdmin">
          <td colspan="2">
            <app-submit
              :running="running"
              class="red-btn"
              type="button"
              value="DELETE THIS ROOM"
              @click.native="deleteRoom"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              :running="running"
              class="green-btn"
              value="APPLY SETTINGS"
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
import {
  ApplyGrowlErr,
  State
} from "@/ts/instances/storeInstance";
import {
  Component,
  Vue
} from "vue-property-decorator";
import AppInputRange from "@/vue/ui/AppInputRange.vue";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import AppCheckbox from "@/vue/ui/AppCheckbox.vue";
import type {
  RoomModel,
  UserModel
} from "@/ts/types/model";
import {
  RoomDictModel,
  UserDictModel
} from "@/ts/types/model";
import {ALL_ROOM_ID} from "@/ts/utils/consts";
import ParentChannel from "@/vue/parts/ParentChannel.vue";
import PickUser from "@/vue/parts/PickUser.vue";
import {PrivateRoomsIds} from "@/ts/types/types";


@Component({
  name: "RoomSettings",
  components: {
    PickUser,
    ParentChannel,
    AppInputRange,
    AppSubmit,
    AppCheckbox,
  }
})
export default class RoomSettings extends Vue {
  public admin: number[] = [];
  public roomName: string = "";
  public sound: number = 0;
  public channelId: number | null = null;
  public notifications: boolean = false;
  public running: boolean = false;
  public isPublic: boolean = false;
  public p2p: boolean = false;
  @State
  public readonly myId!: number;
  @State
  public readonly roomsDict!: RoomDictModel;
  @State
  public readonly privateRoomsUsersIds!: PrivateRoomsIds;
  @State
  public readonly allUsersDict!: UserDictModel;

  get room(): RoomModel {
    return this.roomsDict[this.roomId];
  }

  get roomId(): number {
    const id = this.$route.params.id as string;
    this.$logger.log("Rending room settings for {}", id)();

    return parseInt(id);
  }

  get user(): string | null {
    if (this.room.name) {
      return null;
    }
    const uId = this.privateRoomsUsersIds.roomUsers[this.room.id];
    return this.allUsersDict[uId].user;
  }

  get isAdmin(): boolean {
    return this.room.creator === this.myId;
  }

  get showInviteUsers() {
    return this.admin.length < 1;
  }

  get canChangeAdmin() {
    return this.isPublic && (!this.room.creator || this.myId === this.room.creator);
  }

  get userIds(): number[] {
    return [...this.room.users];
  }

  get oldAdmin(): UserModel | null {
    if (this.room.creator) {
      return this.allUsersDict[this.room.creator];
    }
    return null;
  }

  get isMainRoom(): boolean {
    return this.roomId === ALL_ROOM_ID;
  }

  get singleAdmin(): number {
    if (this.admin.length > 0) {
      return this.admin[0];
    }
    return this.room.creator;
  }

  public created() {
    this.setVars();
  }

  @ApplyGrowlErr({runningProp: "running"})
  public async deleteRoom() {
    if (this.room.name && !confirm(`Are you sure you want to delete room ${this.room.name}`)) {
      return;
    }
    this.$logger.log("deleting room {}", this.roomId)();
    await this.$ws.sendDeleteRoom(this.roomId);
  }

  @ApplyGrowlErr({runningProp: "running"})
  public async leaveRoom() {
    if (this.room.name && !confirm(`Are you sure you want to leave room ${this.room.name}`)) {
      return;
    }
    this.$logger.log("Leaving room {}", this.roomId)();
    await this.$ws.sendLeaveRoom(this.roomId);
  }

  @ApplyGrowlErr({
    runningProp: "running",
    message: "Can't set room settings"
  })
  public async apply() {
    this.$logger.log("Applying room {} settings", this.roomId)();
    await this.$ws.sendRoomSettings({
      roomCreatorId: this.singleAdmin,
      volume: this.sound,
      notifications: this.notifications,
      name: this.roomName,
      isMainInChannel: this.room.isMainInChannel,
      roomId: this.roomId,
      p2p: this.p2p,
      channelId: this.channelId,
    });
    this.$store.growlSuccess("Settings has been saved");
    this.$router.replace(`/chat/${this.roomId}`);
  }

  private setVars() {
    this.$logger.log("Updated for room settings {} ", this.room)();
    if (this.room) {
      this.roomName = this.room.name;
      this.isPublic = Boolean(this.roomName);
      this.sound = this.room.volume;
      this.notifications = this.room.notifications;
      this.p2p = this.room.p2p;
      this.channelId = this.room.channelId;
      if (this.room.creator) {
        this.admin = [this.room.creator];
      } else {
        this.admin = [];
      }
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/sass/partials/abstract_classes"

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
