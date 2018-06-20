<template>
  <table class="window-body">
    <tbody><tr id="roomSettNameHolder" class="hidden">
      <th>
        Name
      </th>
      <td>
        <input type="text" id="roomSettName" maxlength="16">
      </td>
    </tr>
    <tr>
      <th>
        Notifications
      </th>
      <td>
        <input type="checkbox" id="roomSettNotifications">
        <label for="roomSettNotifications"></label>
      </td>
    </tr>
    <tr>
      <th>
        Sound
      </th>
      <td>
        <input type="range" id="roomSettSound" min="0" max="3">
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <input type="button" class="red-btn" value="LEAVE THIS ROOM" id="roomSettExit">
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <input type="button" class="green-btn" value="APPLY SETTINGS" id="roomSettApply">
      </td>
    </tr>
    </tbody></table>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class RoomSettings extends Vue {

  }
</script>

<style lang="sass" scoped>
</style>