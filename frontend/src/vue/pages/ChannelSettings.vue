<template>
  <div class="top-div">
    <form
      v-if="channel"
      class="holder"
      @submit.prevent="apply"
    >
      <table>
        <tbody>
          <tr>
            <td colspan="2">
              Group <b>{{ channel.name }}</b> settings
            </td>
          </tr>
          <tr>
            <th>
              Name
            </th>
            <td>
              <input
                v-model="channelName"
                class="input"
                maxlength="16"
                required="true"
                type="text"
              />
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
          <tr>
            <th>Admin</th>
            <td v-if="isAdmin">
              <pick-user
                v-model="admin"
                :show-invite-users="showInviteUsers"
                :users-ids="userIds"
              />
            </td>
            <td v-else-if="currentAdmin">
              {{ currentAdmin.user }}
            </td>
            <!-- TODO remove fallback in future-->
            <td v-else>
              This channel doesnt have an admin
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <app-submit
                v-if="isAdmin"
                :running="running"
                class="red-btn"
                type="button"
                value="DELETE THIS GROUP"
                @click.native="deleteChannel"
              />
              <app-submit
                v-else-if="noRooms"
                :running="running"
                class="red-btn"
                type="button"
                value="LEAVE THIS GROUP"
                @click.native="leaveChannel"
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
      Channel #{{ channelId }} doesn't exist
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import type {
  ChannelUIModel,
  UserModel,
} from "@/ts/types/model";
import {
  ChannelsDictUIModel,
  CurrentUserInfoModel,
} from "@/ts/types/model";
import {
  ApplyGrowlErr,
  State,
} from "@/ts/instances/storeInstance";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import PickUser from "@/vue/parts/PickUser.vue";
import type {RouterNavigateMessage} from "@/ts/types/messages/innerMessages";
import {ALL_ROOM_ID} from "@/ts/utils/consts";
import AppInputRange from "@/vue/ui/AppInputRange.vue";
import AppCheckbox from "@/vue/ui/AppCheckbox.vue";

@Component({
  name: "ChannelSettings",
  components: {
    AppCheckbox,
    AppInputRange,
    PickUser,
    AppSubmit,
  },
})
export default class ChannelSettings extends Vue {
  public running: boolean = false;

  public channelName!: string;

  public admin: number[] = [];

  public sound: number = 0;

  public notifications: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly allUsersDict!: Record<number, UserModel>;

  @State
  public readonly channelsDictUI!: ChannelsDictUIModel;

  public get channel(): ChannelUIModel {
    return this.channelsDictUI[this.channelId];
  }

  public get showInviteUsers() {
    return this.admin.length < 1;
  }

  public get singleAdmin(): number {
    if (this.admin.length > 0) {
      return this.admin[0];
    }
    return this.channel.creator;
  }

  public get noRooms(): boolean {
    return this.channel.rooms.length === 0;
  }

  public get isAdmin(): boolean {
    return this.channel.creator === this.userInfo.userId;
  }

  public get userIds(): number[] {
    return [...this.channel.mainRoom.users];
  }

  public get currentAdmin(): UserModel {
    return this.allUsersDict[this.channel.creator];
  }

  public get channelId(): number {
    const id = this.$route.params.id as string;
    this.$logger.log("Rending channel settings for {}", id)();

    return parseInt(id);
  }

  @ApplyGrowlErr({runningProp: "running"})
  async apply() {
    if (this.isAdmin && this.admin.length === 0) {
      throw Error("Pick an admin");
    }
    await this.$ws.saveChannelSettings(
      this.channelName,
      this.channelId,
      this.singleAdmin,
      this.sound,
      this.notifications,
    );
    this.$store.growlSuccess("Settings has been saved");
    this.$router.go(-1);
  }

  @ApplyGrowlErr({runningProp: "running"})
  public async leaveChannel(): Promise<void> {
    if (!confirm(`Are you sure you want to leave group ${this.channel.name}`)) {
      return;
    }
    await this.$ws.sendLeaveChannel(this.channelId);
    this.goToMain();
    this.$store.growlSuccess("Channel has been left");
  }

  @ApplyGrowlErr({runningProp: "running"})
  public async deleteChannel(): Promise<void> {
    if (!confirm(`Are you sure you want to delete group ${this.channel.name}`)) {
      return;
    }
    await this.$ws.sendDeleteChannel(this.channelId);
    this.goToMain();
    this.$store.growlSuccess("Channel has been deleted");
  }

  created() {
    this.$logger.log("Updated for channel settings {} ", this.channel)();
    this.channelName = this.channel.name;
    this.admin = [this.channel.creator];
    this.sound = this.channel.mainRoom.volume;
    this.notifications = this.channel.mainRoom.notifications;
  }

  private goToMain() { // TODO, should go back instead of main
    const message1: RouterNavigateMessage = {
      handler: "router",
      action: "navigate",
      to: `/chat/${ALL_ROOM_ID}`,
    };
    this.$messageBus.notify(message1);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

.top-div
  display: flex
  justify-content: center

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
