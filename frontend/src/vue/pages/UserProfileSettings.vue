<template>
  <div>
    <table>
      <tbody>
        <tr>
          <th>Suggestions:</th>
          <td>
            <app-checkbox v-model="model.suggestions" />
          </td>
        </tr>
        <tr>
          <th>Embedded youtube:</th>
          <td>
            <app-checkbox v-model="model.embeddedYoutube" />
          </td>
        </tr>
        <tr>
          <th>Highlight code</th>
          <td>
            <app-checkbox v-model="model.highlightCode" />
            ```console.log('Highlight code like this')```
          </td>
        </tr>
        <tr>
          <th>Message sound:</th>
          <td>
            <app-checkbox v-model="model.messageSound" />
          </td>
        </tr>
        <tr>
          <th>Incoming file call sound:</th>
          <td>
            <app-checkbox v-model="model.incomingFileCallSound" />
          </td>
        </tr>
        <tr>
          <th>Online change sound:</th>
          <td>
            <app-checkbox v-model="model.onlineChangeSound" />
          </td>
        </tr>
        <tr>
          <th>Devtools logs:</th>
          <td>
            <app-checkbox v-model="model.logs" />
          </td>
        </tr>
        <tr>
          <th>Automatical error report:</th>
          <td>
            <app-checkbox v-model="model.sendLogs" />
          </td>
        </tr>
        <tr>
          <th>Theme:</th>
          <td>
            <select
              v-model="model.theme"
              name="theme"
              class="input"
            >
              <option
                value="color-reg"
                selected="selected"
              >
                Modern
              </option>
              <option value="color-lor">
                Simple
              </option>
              <option value="color-white">
                Light(Beta)
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th><label>Clear history</label></th>
          <td style="padding: 10px 0">
            <input
              type="button"
              class="lor-btn"
              value="clear now"
              @click="clearHistory"
            >
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              class="green-btn"
              value="Apply Settings"
              :running="running"
              @click.native="save"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import {State} from '@/ts/instances/storeInstance';
import AppSubmit from '@/vue/ui/AppSubmit';
import AppCheckbox from '@/vue/ui/AppCheckbox';
import {CurrentUserInfoModel, CurrentUserSettingsModel} from '@/ts/types/model';
import {currentUserInfoDtoToModel, currentUserInfoModelToDto, userSettingsDtoToModel} from '@/ts/types/converters';
import {UserSettingsDto} from '@/ts/types/dto';
import {ApplyGrowlErr} from '@/ts/instances/storeInstance';
import {SetSettingsMessage} from '@/ts/types/messages';

@Component({
  components: {AppSubmit, AppCheckbox}
})
export default class UserProfileSettings extends Vue {
  public running: boolean = false;
  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  private model!: UserSettingsDto;

  public created() {
    this.model = userSettingsDtoToModel(this.userSettings);
  }

  @Watch('userSettings', {deep: true})
  public onUserSettingsChange() {
    this.model = userSettingsDtoToModel(this.userSettings);
  }

  public clearHistory() {
    this.$store.clearMessages();
  }

  @ApplyGrowlErr({ message: 'Error saving settings', runningProp: 'running'})
  public async save() {
    this.$logger.debug('Saving userSettings')();
    const cui: UserSettingsDto = {...this.model};
    const e: SetSettingsMessage|unknown = await this.$ws.saveSettings(cui);
    this.$store.growlSuccess('Settings have been saved');
  }
}
</script>

<style lang="sass" scoped>
  .lor-btn
    width: 100%
</style>
