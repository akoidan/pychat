<template>
  <div class="holder">
    <pick-user
      v-model="currentUsers"
      :text="`Add users to room ${currentRoom.name}`"
      :users-ids="userIds"
    />
    <app-submit
      type="button"
      value="Apply"
      class="green-btn"
      :running="running"
      @click.native="add"
    />
  </div>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import {State} from '@/utils/storeHolder';
  import AppSubmit from "@/components/ui/AppSubmit";
  import PickUser from "@/components/pages/parts/PickUser";
  import {RoomDictModel, RoomModel, UserModel} from "@/types/model";
  import {AddInviteMessage} from "@/types/messages";
  import {ApplyGrowlErr} from '@/utils/storeHolder';

  @Component({components: { AppSubmit, PickUser}})
  export default class InviteUser extends Vue {

    @State
    public readonly roomsDict!: RoomDictModel;

    currentUsers: number[] = [];
    running: boolean = false;

    get currentRoomId(): number {
      return parseInt(this.$route.params['id']);
    }

    get currentRoom(): RoomModel {
      return this.roomsDict[this.currentRoomId];
    }

    get userIds(): number[] {
      const users: number[] = [];
      this.store.usersArray.forEach(a => {
        if (this.currentRoom.users.indexOf(a.id) < 0) {
          users.push(a.id);
        }
      });
      return users;
    }

    @ApplyGrowlErr({runningProp: 'running'})
    async add() {
      if (this.currentUsers.length > 0) {
        const e = await this.$ws.inviteUser(this.currentRoomId, this.currentUsers);
        this.$router.replace(`/chat/${e.roomId}`);
      } else {
        this.store.growlError("Please select at least one user");
      }
    }
  }
</script>
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"

  .holder
    @extend %room-settings-holder

  .green-btn
    flex-shrink: 0
</style>
