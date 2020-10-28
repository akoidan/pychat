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
              :required="isPublic"
              class="input"
              maxlength="16"
            >
            <div v-if="!isPublic && roomName">
              By adding name to this room, you'll make it public
            </div>
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
        <tr>
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
import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue} from 'vue-property-decorator';
import AppInputRange from '@/components/ui/AppInputRange';
import AppSubmit from '@/components/ui/AppSubmit';
import AppCheckbox from '@/components/ui/AppCheckbox';
import {RoomDictModel, RoomModel, RoomSettingsModel} from '@/types/model';
import {ApplyGrowlErr} from '@/utils/utils';
import {ALL_ROOM_ID} from '@/utils/consts';
@Component({components: {AppInputRange, AppSubmit, AppCheckbox}})
export default class RoomSettings extends Vue {

  get room(): RoomModel {
    return this.roomsDict[this.roomId];
  }

  get roomId(): number {
    const id = this.$route.params.id;
    this.logger.log('Rending room settings for {}', id)();

    return parseInt(id);
  }

  public roomName: string = '';
  public sound: number = 0;
  public notifications: boolean = false;
  public running: boolean = false;
  public isPublic: boolean = false;
  @State
  public readonly roomsDict!: RoomDictModel;


  @ApplyGrowlErr({runningProp: 'running'})
  public async leave() {
    this.logger.log('Leaving room {}', this.roomId)();
    await this.$ws.sendLeaveRoom(this.roomId);
    this.$router.replace(`/chat/${ALL_ROOM_ID}`);
  }

  public created() {
    this.setVars();
  }

  @ApplyGrowlErr({runningProp: 'running', message: `Can't set room settings`})
  public async apply() {
    this.logger.log('Applying room {} settings', this.roomId)();
    await this.$api.sendRoomSettings(this.roomName, this.sound, this.notifications, this.roomId);
    const payload: RoomSettingsModel = {
      id: this.roomId,
      name: this.roomName,
      channelId: this.room.channelId,
      notifications: this.notifications,
      volume: this.sound
    };
    this.store.setRoomSettings(payload);
    this.store.growlSuccess('Settings has been saved');
    this.$router.go(-1);
  }

  private setVars() {
    this.logger.log('Updated for room settings {} ', this.room)();
    if (this.room) {
      this.roomName = this.room.name;
      this.isPublic = !!this.roomName;
      this.sound = this.room.volume;
      this.notifications = this.room.notifications;
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
