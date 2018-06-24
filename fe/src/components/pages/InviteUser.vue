<template>
  <div class="holder">
    <add-user-to-room v-model="currentUsers" :text="`Add users to room ${currentRoom.name}`" :exclude-users-ids="excludeUsersIds"/>
    <app-submit type="button" @click.native="add" value="Apply" class="green-btn" :running="running"/>
  </div>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";
  import AppSubmit from "../ui/AppSubmit.vue";
  import AddUserToRoom from "./parts/AddUserToRoom.vue";
  import {RoomDictModel, UserModel} from "../../types/model";

  @Component({components: { AppSubmit, AddUserToRoom}})
  export default class InviteUser extends Vue {

    @State roomsDict: RoomDictModel;
    currentUsers: UserModel[] = [];
    running: boolean = false;

    get currentRoomId() {
      return this.$route.params['id'];
    }

    get currentRoom() {
      return this.roomsDict[this.currentRoomId];
    }

    get excludeUsersIds() {
      return this.currentRoom.users;
    }

    add() {

    }
  }
</script>
<style lang="sass" scoped>
  @import "partials/abstract_classes"

  .holder
    @extend %room-settings-holder
</style>
