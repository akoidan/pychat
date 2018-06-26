<template>
  <form method="post" id="changeProfileForm" enctype="multipart/form-data" onsubmit="saveProfile(event)">
    <input type="hidden" name="csrfmiddlewaretoken" value="7VA4zTASE4wcz37pCnH7qROXPaKgKTXg">
    <div class="padding10">
      <table class="biginputtext" id="userProfileData">
        <tbody>
        <tr><th><label for="id_suggestions">Suggestions:</label></th><td><input id="id_suggestions" name="suggestions" type="checkbox"><label for="id_suggestions"></label></td></tr>
        <tr><th><label for="id_embedded_youtube">Embedded youtube:</label></th><td><input checked="checked" id="id_embedded_youtube" name="embedded_youtube" type="checkbox"><label for="id_embedded_youtube"></label></td></tr>
        <tr><th><label for="id_highlight_code">Highlight code:</label></th><td><input checked="checked" id="id_highlight_code" name="highlight_code" type="checkbox"><label for="id_highlight_code"></label><br><span class="helptext">```console.log('Highlight code like this')```</span></td></tr>
        <tr><th><label for="id_message_sound">Message sound:</label></th><td><input checked="checked" id="id_message_sound" name="message_sound" type="checkbox"><label for="id_message_sound"></label></td></tr>
        <tr><th><label for="id_incoming_file_call_sound">Incoming file call sound:</label></th><td><input id="id_incoming_file_call_sound" name="incoming_file_call_sound" type="checkbox"><label for="id_incoming_file_call_sound"></label></td></tr>
        <tr><th><label for="id_online_change_sound">Online change sound:</label></th><td><input id="id_online_change_sound" name="online_change_sound" type="checkbox"><label for="id_online_change_sound"></label></td></tr>
        <tr><th><label for="id_logs">Logs:</label></th><td><input checked="checked" id="id_logs" name="logs" type="checkbox"><label for="id_logs"></label></td></tr>
        <tr><th><label for="id_send_logs">Send logs:</label></th><td><input checked="checked" id="id_send_logs" name="send_logs" type="checkbox"><label for="id_send_logs"></label></td></tr>
        <tr><th><label for="id_theme">Theme:</label></th><td><select id="id_theme" name="theme">
          <option value="color-reg" selected="selected">Modern</option>
          <option value="color-lor">Simple</option>
          <option value="color-white">Light(Beta)</option>
        </select></td></tr>
        <tr>
          <th><label>Clear history</label></th>
          <td style="padding: 10px 0">
            <input type="button" class="button lor-btn" value="clear now" onclick="channelsHandler.clearChannelHistory()">
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit class="green-btn" value='Apply Settings' :running="running"/>
          </td>
        </tr>
        </tbody></table>
    </div>
  </form>
</template>
<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import AppSubmit from "../ui/AppSubmit";

  @Component({
    components: {AppSubmit}
  })
  export default class UserProfileSettings extends Vue {
    running: boolean = false;
  }
</script>

<style lang="sass" scoped>
</style>