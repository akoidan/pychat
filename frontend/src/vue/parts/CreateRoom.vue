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
              class="input"
              maxlength="16"
              type="text"
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
        <tr v-if="!p2p">
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
      </tbody>
    </table>
    <pick-user
      v-model="currentUsers"
      :show-invite-users="showInviteUsers"
      :text="inviteUsers"
      :users-ids="userIds"
    />
    <app-submit
      :running="running"
      class="green-btn"
      type="button"
      value="Create Room"
      @click.native="add"
    />
  </div>
</template>
<script lang="ts">
import {ApplyGrowlErr, State} from "@/ts/instances/storeInstance";
import {Component, Prop, Vue} from "vue-property-decorator";
import AppInputRange from "@/vue/ui/AppInputRange.vue";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import PickUser from "@/vue/parts/PickUser.vue";
import {ChannelsDictUIModel, CurrentUserInfoModel} from "@/ts/types/model";
import AppCheckbox from "@/vue/ui/AppCheckbox.vue";
import {PrivateRoomsIds} from "@/ts/types/types";
import ParentChannel from "@/vue/parts/ParentChannel.vue";

@Component({
  name: "CreateRoom",
  components: {
    ParentChannel,
    AppCheckbox,
    AppInputRange,
    AppSubmit,
    PickUser,
  },
})
export default class CreateRoom extends Vue {
  @State
  public readonly privateRoomsUsersIds!: PrivateRoomsIds;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly channelsDictUI!: ChannelsDictUIModel;

  public currentUsers: number[] = [];

  public notifications: boolean = false;

  public sound: number = 0;

  public p2p: boolean = false;

  public roomName: string = "";

  public running: boolean = false;

  @Prop() public isPublic!: boolean;

  @Prop() public readonly parentChannelId!: number;

  @Prop()
  public readonly userIds!: number[];

  public get inviteUsers(): string {
    if (this.parentChannelId) {
      return `Users in a new room in group ${this.channelsDictUI[this.parentChannelId].name}`;
    }
    return this.isPublic ? "Invite users to new room" : "Select user for private room";
  }

  public get showInviteUsers() {
    return this.isPublic || this.currentUsers.length < 1;
  }


  @ApplyGrowlErr({runningProp: "running"})
  public async add() {
    if (this.isPublic && !this.roomName) {
      throw Error("Please specify room name");
    }
    if (!this.isPublic && this.currentUsers.length === 0) {
      throw Error("Please add user");
    }
    const e = await this.$ws.sendAddRoom(
      {
        users: this.currentUsers,
        name: this.roomName ? this.roomName : null,
        p2p: this.isPublic ? false : this.p2p,
        channelId: this.parentChannelId ? this.parentChannelId : null,
        volume: this.sound,
        notifications: !this.p2p && this.notifications,
      },
    );
    this.$router.replace(`/chat/${e.id}`);
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

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
