<template>
  <form
    class="holder"
    method="post"
    @submit.prevent="save"
  >
    <table>
      <tbody>
        <tr>
          <th>Username:</th>
          <td>
            <input
              v-model="model.user"
              class="input"
              maxlength="30"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th>Name:</th>
          <td>
            <input
              v-model="model.name"
              class="input"
              maxlength="30"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th>City:</th>
          <td>
            <input
              v-model="model.city"
              class="input"
              maxlength="50"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th>Surname</th>
          <td>
            <input
              v-model="model.surname"
              class="input"
              maxlength="30"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th>Birthday</th>
          <td>
            <app-input-date
              v-model="model.birthday"
              input-class="input"
              input-class-datepicker="input-date"
            />
          </td>
        </tr>
        <tr>
          <th>Contacts:</th>
          <td>
            <input
              v-model="model.contacts"
              class="input"
              maxlength="100"
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th>Sex:</th>
          <td>
            <select
              v-model="model.sex"
              class="input"
            >
              <option
                v-for="s in sex"
                :key="s"
                :value="s"
              >
                {{ s }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              :running="running"
              class="green-btn"
              value="Save Profile"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              class="red-btn"
              type="button"
              value="Sign out"
              @click.native="signOut"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>
<script lang="ts">
import {
  ApplyGrowlErr,
  State,
} from "@/ts/instances/storeInstance";
import {
  Component,
  Vue,
} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {CurrentUserInfoModel} from "@/ts/types/model";
import type {UserProfileDtoWoImage} from "@/ts/types/dto";

import {currentUserInfoModelToDto} from "@/ts/types/converters";
import AppInputDate from "@/vue/ui/AppInputDate.vue";
import type {SetUserProfileMessage} from "@/ts/types/messages/wsInMessages";
import type {LogoutMessage} from "@/ts/types/messages/innerMessages";
import {Gender} from '@/ts/types/backend/dto';

@Component({
  name: "UserProfileInfo",
  components: {
    AppInputDate,
    AppSubmit,
  },
})
export default class UserProfileInfo extends Vue {
  public running: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public sex: Gender[] = [Gender.MALE, Gender.FEMALE, Gender.OTHER];

  public model!: UserProfileDtoWoImage;

  public created() {
    this.model = currentUserInfoModelToDto(this.userInfo);
  }

  @ApplyGrowlErr({
    message: "Error saving profile",
    runningProp: "running",
  })
  public async save() {
    this.$logger.debug("Saving userProfile")();
    const cui: UserProfileDtoWoImage = {...this.model};
    const e: SetUserProfileMessage | unknown = await this.$ws.saveUser(cui);
    this.$store.growlSuccess("User profile has been saved");
  }


  public async signOut() {
    this.$api.logout(); // Do not make user wait, logout instantly
    const message: LogoutMessage = {
      action: "logout",
      handler: "*",
    };
    this.$messageBus.notify(message);
  }
}
</script>

<style lang="sass" scoped>
.holder :deep(.input.input-date)
  width: 100%
</style>
