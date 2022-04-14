<template>
  <div class="settings-page">
    <table>
      <tbody>
        <tr>
          <th>Suggestions:</th>
          <td>
            <app-checkbox v-model="model.suggestions"/>
          </td>
        </tr>
        <tr>
          <th>Show when I'm writing message</th>
          <td>
            <app-checkbox v-model="model.showWhenITyping"/>
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
          <th>Online change messages:</th>
          <td>
            <app-checkbox v-model="model.onlineChangeSound"/>
          </td>
        </tr>
        <tr>
          <th>Devtools logs:</th>
          <td>
            <select v-model="model.logs" class="input">
              <option v-for="level in logLevels" :value="level">
                {{ level }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>Theme:</th>
          <td>
            <select
              v-model="model.theme"
              class="input"
              name="theme"
            >
              <option
                selected
                value="color-reg"
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
          <td colspan="2">
            <input
              class="lor-btn"
              type="button"
              value="Delete app cache"
              @click="clearHistory"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <input
              v-if="canBeInstalled"
              class="lor-btn"
              type="button"
              value="Add to home screen"
              @click="addToHomeScreen"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              :running="running"
              class="green-btn"
              value="Apply Settings"
              @click.native="save"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
  Watch,
} from "vue-property-decorator";
import {
  ApplyGrowlErr,
  State,
} from "@/ts/instances/storeInstance";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import AppCheckbox from "@/vue/ui/AppCheckbox.vue";
import {CurrentUserSettingsModel} from "@/ts/types/model";
import {userSettingsDtoToModel} from "@/ts/types/converters";
import type {UserSettingsDto} from "@/ts/types/dto";
import type {SetSettingsMessage} from "@/ts/types/backend";
import type {LogLevel} from "lines-logger";
import {logLevels} from "lines-logger";
import {
  LAST_SYNCED,
  SERVICE_WORKER_VERSION_LS_NAME,
} from "@/ts/utils/consts";
import {
  addToHomeScreen,
  canBeInstalled,
} from "@/ts/utils/addToHomeScreen";

@Component({
  name: "UserProfileSettings",
  components: {
    AppSubmit,
    AppCheckbox,
  },
})
export default class UserProfileSettings extends Vue {
  public running: boolean = false;

  public canBeInstalled: boolean = true;

  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  public model!: UserSettingsDto;

  public readonly logLevels: LogLevel[] = Object.keys(logLevels) as LogLevel[];

  public async created() {
    this.model = userSettingsDtoToModel(this.userSettings);
    this.canBeInstalled = await canBeInstalled();
  }

  @Watch("userSettings", {deep: true})
  public onUserSettingsChange() {
    this.model = userSettingsDtoToModel(this.userSettings);
  }

  public async addToHomeScreen() {
    await addToHomeScreen();
  }

  public async clearHistory() {
    if (!confirm("This action will delete Service Worker cache and Websql data on your device. Proceed?")) {
      return;
    }

    /*
     * Do not remove lastSynced, instead set it to now
     * because if we go offline after clearing cache
     * message that are printing after it, won't appear while offline
     * to reproduce: chance to reproduce 50%.
     * Open 2 browsers (lets say chrome, + chrome annon).
     * Clear history on 2nd one. Type  `window.ws.ws.close()` on 2nd one.
     * Clicly switch to first one and send message in less than 5 seconds (reconnect time).
     * Open 2nd one and when internet appears the message might not appear while you were offline
     */
    localStorage.setItem(LAST_SYNCED, Date.now().toString());
    if (typeof self !== "undefined") {
      const cacheNames = await self.caches.keys();
      await Promise.all(cacheNames.map(async(cn) => {
        this.$logger.log(`Deleting cache '${cn}'`)();
        return caches.delete(cn);
      }));
    }
    localStorage.removeItem(SERVICE_WORKER_VERSION_LS_NAME);
    this.$store.clearMessages();
    this.$store.growlSuccess("Cash has been deleted ");
  }

  @ApplyGrowlErr({
    message: "Error saving settings",
    runningProp: "running",
  })
  public async save() {
    this.$logger.debug("Saving userSettings")();
    const cui: UserSettingsDto = {...this.model};
    const e: SetSettingsMessage | unknown = await this.$ws.saveSettings(cui);
    this.$store.growlSuccess("Settings have been saved");
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

.lor-btn
  width: 100%

.settings-page
  :deep(button)
    width: 100%
  padding-top: 10px
  padding-bottom: 10px

  :deep(table)
    margin: auto

  :deep(th)
    text-align: right

  :deep(td), :deep(th)
    padding: 4px

  :deep(.input)
    @extend %big-input
</style>
