<template>
  <div class="holder">
    <add-user-to-room v-model="currentUsers" :text="`Add users to room ${currentRoom.name}`" :exclude-users-ids="excludeUsersIds"/>
    <app-submit type="button" @click.native="add" value="Apply" class="green-btn" :running="running"/>
  </div>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import {State} from '@/utils/storeHolder';
  import AppSubmit from "@/components/ui/AppSubmit";
  import AddUserToRoom from "@/components/pages/parts/AddUserToRoom";
  import {RoomDictModel, RoomModel, UserModel} from "@/types/model";
  import {AddInviteMessage} from "@/types/messages";

  @Component({components: { AppSubmit, AddUserToRoom}})
  export default class InviteUser extends Vue {

    @State
    public readonly roomsDict!: RoomDictModel;

    currentUsers: UserModel[] = [];
    running: boolean = false;

    get currentRoomId(): number {
      return parseInt(this.$route.params['id']);
    }

    get currentRoom(): RoomModel {
      return this.roomsDict[this.currentRoomId];
    }

    get excludeUsersIds(): number[] {
      return this.currentRoom.users;
    }

    add() {
      if (this.currentUsers.length > 0) {
        this.running = true;
        this.$ws.inviteUser(this.currentRoomId, this.currentUsers.map(u => u.id), (e: AddInviteMessage) => {
          this.running = false;
          if (e.roomId) {
            this.$router.replace(`/chat/${e.roomId}`);
          }
        });
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
