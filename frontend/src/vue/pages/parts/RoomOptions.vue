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
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';

@Component({name: 'RoomOptions'})
 export default class RoomOptions extends Vue {


    public roomName: string = '';
    public sound: number = 0;
    public channelId: number|null = null;
    public notifications: boolean = false;
    public running: boolean = false;
    public isPublic: boolean = false;
  }
</script>
<!-- eslint-disable -->
<style
    lang="sass"
    scoped
>
</style>
