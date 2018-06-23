<template>
  <form class="holder" @submit.prevent='apply' v-if="room">
    <table>
      <tbody>
      <tr v-if="isPublic">
        <th>
          Name
        </th>
        <td>
          <input type="text" :required="isPublic" class="input" v-model="roomName" maxlength="16">
          <div v-if="!isPublic && roomName">By adding name to this room, you'll make it public </div>
        </td>
      </tr>
      <tr>
        <th>
          Notifications
        </th>
        <td>
          <input v-model="notifications" type="checkbox" id="roomSettingsCheckbox">
          <label for="roomSettingsCheckbox"></label>
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
      <tr>
        <td colspan="2">
          <app-submit type="button" class="red-btn" @click.native="leave" value="LEAVE THIS ROOM" :running="running"/>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <app-submit value="APPLY SETTINGS" class="green-btn" :running="running"/>
        </td>
      </tr>
      </tbody>
    </table>
  </form>
  <div v-else>Room {{roomId}} doesn't exist </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppInputRange from '../ui/AppInputRange';
  import AppSubmit from '../ui/AppSubmit';
  import {api, globalLogger, ws} from "../../utils/singletons";
  import {RoomModel, RoomSettingsModel} from "../../model";
  @Component({components: {AppInputRange, AppSubmit}})
  export default class RoomSettings extends Vue {

    roomName: string = "";
    sound: number = 0;
    notifications: boolean = false;
    running: boolean = false;
    isPublic: boolean = false;
    @State roomsDict: {[id: string]: RoomModel};

    @Action growlError;
    @Action growlSuccess;
    @Mutation setRoomSettings;

    leave() {
      globalLogger.log("Leaving room {}", this.roomId)();
      this.running = true;
      ws.sendLeaveRoom(this.roomId, () => {
        this.running = false;
        this.$router.replace('/chat/1');
      });
    }


    created() {
      this.setVars();
    }

    private setVars() {
      globalLogger.log("Updated for room settings {} ", this.room)();
      if (this.room) {
        this.roomName = this.room.name;
        this.isPublic = !!this.roomName;
        this.sound = this.room.volume;
        this.notifications = this.room.notifications;
      }
    }

    get room(): RoomModel {
      return this.roomsDict[this.roomId];
    }

    get roomId() : number {
      let id = this.$route.params.id;
      globalLogger.log("Rending room settings for {}", id)();
      return parseInt(id);
    }


    apply() {
      globalLogger.log("Applying room {} settings", this.roomId)();
      this.running = true;
      api.sendRoomSettings(this.roomName, this.sound, this.notifications, this.roomId, (err) => {
        if (err) {
          this.growlError(err);
        } else {
          let payload: RoomSettingsModel = {
            id: this.roomId,
            name: this.roomName,
            notifications: this.notifications,
            volume: this.sound
          };
          this.setRoomSettings(payload);
          this.growlSuccess('Settings has been saved');
          this.$router.go(-1);
        }
        this.running = false;
      });
    }
  }
</script>

<style lang="sass" scoped>
  @import "partials/abstract_classes"

  .holder
    overflow-y: auto
    display: flex
    justify-content: center
    align-items: center
  input[type=checkbox]
    @extend %checkbox

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