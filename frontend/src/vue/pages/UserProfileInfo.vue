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
              maxlength="30"
              class="input"
              type="text"
            >
          </td>
        </tr>
        <tr>
          <th>Name:</th>
          <td>
            <input
              v-model="model.name"
              maxlength="30"
              class="input"
              type="text"
            >
          </td>
        </tr>
        <tr>
          <th>City:</th>
          <td>
            <input
              v-model="model.city"
              maxlength="50"
              class="input"
              type="text"
            >
          </td>
        </tr>
        <tr>
          <th>Surname</th>
          <td>
            <input
              v-model="model.surname"
              maxlength="30"
              class="input"
              type="text"
            >
          </td>
        </tr>
        <tr>
          <th>Birthday</th>
          <td>
            <app-input-date
              v-model="model.birthday"
              input-class-datepicker="input-date"
              input-class="input"
            />
          </td>
        </tr>
        <tr>
          <th>Contacts:</th>
          <td>
            <input
              v-model="model.contacts"
              maxlength="100"
              class="input"
              type="text"
            >
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
              class="green-btn"
              value="Save Profile"
              :running="running"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
              type="button"
              class="red-btn"
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
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';
import {Component, Vue} from 'vue-property-decorator';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import {CurrentUserInfoModel, SexModelString} from '@/ts/types/model';
import {UserProfileDto} from '@/ts/types/dto';
import {currentUserInfoModelToDto} from '@/ts/types/converters';
import AppInputDate from '@/vue/ui/AppInputDate.vue';
import { SetUserProfileMessage } from '@/ts/types/messages/wsInMessages';
import {LogoutMessage} from '@/ts/types/messages/innerMessages';
import {sub} from '@/ts/instances/subInstance';

@Component({
  components: {AppInputDate, AppSubmit}
})
export default class UserProfileInfo extends Vue {
  public running: boolean = false;
  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public sex: SexModelString[] = ['Male', 'Female', 'Secret'];
  private model!: UserProfileDto;

  public created() {
    this.model = currentUserInfoModelToDto(this.userInfo);
  }

  @ApplyGrowlErr({ message: 'Error saving profile', runningProp: 'running'})
  public async save() {
    this.$logger.debug('Saving userProfile')();
    const cui: UserProfileDto = {...this.model};
    const e: SetUserProfileMessage | unknown = await this.$ws.saveUser(cui);
    this.$store.growlSuccess('User profile has been saved');
  }


  public async signOut() {
    this.$api.logout(); // do not make user wait, logout instantly
    let message: LogoutMessage = {
      action: 'logout',
      handler: 'any'
    };
    sub.notify(message);
  }
}
</script>

<style lang="sass" scoped>
  .holder /deep/ .input.input-date
    width: 100%
</style>
