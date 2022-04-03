<template>
  <div class="holder">
    <table>
      <tbody>
        <tr>
          <th>
            Name
          </th>
          <td>
            <input
              v-model="channelName"
              type="text"
              class="input"
              maxlength="16"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <pick-user
      v-model="currentUsers"
      text="Invite users"
      :users-ids="userIds"
    />
    <app-submit
      type="button"
      value="Create Group"
      class="green-btn"
      :running="running"
      @click.native="add"
    />
  </div>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {ALL_ROOM_ID} from "@/ts/utils/consts";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import PickUser from "@/vue/parts/PickUser.vue";

@Component({
  name: "CreateChannel",
  components: {
    PickUser,
    AppSubmit
  },
})
export default class CreateChannel extends Vue {
  public channelName: string = "";

  public running: boolean = false;

  public currentUsers: number[] = [];


  get userIds(): number[] {
    return this.$store.usersArray.map((u) => u.id);
  }

  @ApplyGrowlErr({runningProp: "running",
    message: "Unable to add channel"})
  public async add() {
    if (!this.channelName) {
      throw Error("Please specify a channel name");
    }
    const e = await this.$ws.sendAddChannel(this.channelName, this.currentUsers);
    this.$store.growlSuccess(`Channel '${this.channelName}' has been created`);
    this.$router.replace(`/chat/${ALL_ROOM_ID}`);
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "@/assets/sass/partials/abstract_classes"

  input[type="text"]
    width: 100%

  .holder
    @extend %room-settings-holder

  th, td
    padding: 5px

  .green-btn
    width: 100%
    flex-shrink: 0
</style>
