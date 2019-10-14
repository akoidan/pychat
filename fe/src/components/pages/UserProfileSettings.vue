<template>
  <div>
    <table>
      <tbody>
      <tr>
        <th>Suggestions:</th>
        <td>
          <app-checkbox v-model="model.suggestions"/>
        </td>
      </tr>
      <tr>
        <th>Embedded youtube:</th>
        <td>
          <app-checkbox v-model="model.embeddedYoutube"/>
        </td>
      </tr>
      <tr>
        <th>Highlight code</th>
        <td>
          <app-checkbox v-model="model.highlightCode"/>
          ```console.log('Highlight code like this')```
        </td>
      </tr>
      <tr>
        <th>Message sound:</th>
        <td>
          <app-checkbox v-model="model.messageSound"/>
        </td>
      </tr>
      <tr>
        <th>Incoming file call sound:</th>
        <td>
          <app-checkbox v-model="model.incomingFileCallSound"/>
        </td>
      </tr>
      <tr>
        <th>Online change sound:</th>
        <td>
          <app-checkbox v-model="model.onlineChangeSound"/>
        </td>
      </tr>
      <tr>
        <th>Devtools logs:</th>
        <td>
          <app-checkbox v-model="model.logs"/>
        </td>
      </tr>
      <tr>
        <th>Automatical error report:</th>
        <td>
          <app-checkbox v-model="model.sendLogs"/>
        </td>
      </tr>
      <tr>
        <th>Theme:</th>
        <td>
          <select name="theme" class="input" v-model="model.theme">
            <option value="color-reg" selected="selected">Modern</option>
            <option value="color-lor">Simple</option>
            <option value="color-white">Light(Beta)</option>
          </select>
        </td>
      </tr>
      <tr>
        <th><label>Clear history</label></th>
        <td style="padding: 10px 0">
          <input type="button" class="lor-btn" value="clear now"
                 @click="clearHistory">
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <app-submit class="green-btn" value='Apply Settings' @click.native="save" :running="running"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
  import {Component, Vue, Watch} from "vue-property-decorator";
  import {State} from '@/utils/storeHolder';
  import AppSubmit from "@/components/ui/AppSubmit";
  import AppCheckbox from "@/components/ui/AppCheckbox";
  import {CurrentUserInfoModel, CurrentUserSettingsModel} from "@/types/model";
  import {currentUserInfoDtoToModel, currentUserInfoModelToDto, userSettingsDtoToModel} from "@/types/converters";
  import {UserSettingsDto} from "@/types/dto";
  import {storage} from '@/utils/singletons';
  import {ApplyGrowlErr} from '@/utils/utils';
  import {SetSettingsMessage} from '@/types/messages';

  @Component({
    components: {AppSubmit, AppCheckbox}
  })
  export default class UserProfileSettings extends Vue {
    running: boolean = false;
    @State
    public readonly userSettings!: CurrentUserSettingsModel;

    private model!: UserSettingsDto;

    created() {
      this.model = userSettingsDtoToModel(this.userSettings);
    }

    @Watch('userSettings', {deep: true})
    onUserSettingsChange() {
      this.model = userSettingsDtoToModel(this.userSettings);
    }


    clearHistory() {
      this.store.clearMessages();
    }


    @ApplyGrowlErr({ message: 'Error saving settings', runningProp: 'running'})
    async save() {
      this.logger.debug("Saving userSettings")();
      let cui : UserSettingsDto = {...this.model};
      let e: SetSettingsMessage|unknown = await this.$ws.saveSettings(cui);
      if ((e as SetSettingsMessage).action === 'setSettings') {
          this.store.growlSuccess("Settings have been saved");
      }
    }
  }


</script>

<style lang="sass" scoped>
  .lor-btn
    width: 100%
</style>
