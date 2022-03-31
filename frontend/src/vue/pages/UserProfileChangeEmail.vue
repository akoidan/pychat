<template>
  <form
    class="holder"
    method="post"
    @submit.prevent="saveProfile"
  >
    <table>
      <tbody>
        <tr>
          <th>Enter your password:</th>
          <td>
            <input
              v-model="password"
              autocomplete="password"
              required
              class="input"
              type="password"
              name="password"
              minlength="3"
            >
          </td>
        </tr>
        <tr>
          <th>Email:</th>
          <td>
            <input
              v-model="email"
              maxlength="190"
              class="input"
              type="email"
            >
          </td>
        </tr>
      </tbody>
      <tr>
        <td colspan="2">
          <app-submit
            class="green-btn"
            value="Apply Password"
            :running="running"
          />
        </td>
      </tr>
    </table>
  </form>
</template>
<script lang="ts">
import {State} from '@/ts/instances/storeInstance';
import {Component, Prop, Vue} from 'vue-property-decorator';
import AppSubmit from '@/vue/ui/AppSubmit';
import {CurrentUserInfoModel} from '@/ts/types/model';
import {ApplyGrowlErr} from '@/ts/instances/storeInstance';
@Component({
  name: 'UserProfileChangeEmail' ,
  components: {AppSubmit}
})
export default class UserProfileChangeEmail extends Vue {

  public password: string = '';
  public email: string = '';
  public running: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public created() {
    this.email = this.userInfo.email;
  }

  @ApplyGrowlErr({ message: 'Unable to change email', runningProp: 'running'})
  public async saveProfile() {
    await this.$api.changeEmailLogin(this.email, this.password);
    this.$store.growlSuccess('Email has been changed');
  }
}
</script>

<style lang="sass" scoped>

</style>
