<template>
  <div class="holder">
    <table>
      <tbody>
      <tr>
        <th>
          Name
        </th>
        <td>
          <input type="text" class="input" maxlength="16">
        </td>
      </tr>
      <tr>
        <th>
          Notifications
        </th>
        <td>
          <input type="checkbox" id="roomSettingsCheckbox">
          <label for="roomSettingsCheckbox"></label>
        </td>
      </tr>
      <tr>
        <th>
          Sound
        </th>
        <td>
          <app-input-range min="0" max="3"/>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <input type="button" class="red-btn" value="LEAVE THIS ROOM">
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <input type="button" class="green-btn" value="APPLY SETTINGS">
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppInputRange from '../ui/AppInputRange';
  @Component({components: {AppInputRange}})
  export default class RoomSettings extends Vue {

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

</style>