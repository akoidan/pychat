<template>
  <form
    class="holder"
    method="post"
    @submit.prevent="saveProfile"
  >
    <table>
      <tbody>
        <tr>
          <th title="Leave empty if you signed up with oauth">
            Old password:
          </th>
          <td>
            <input
              v-show="false"
              v-model="username"
              autocomplete="username"
              name="username"
              type="text"
            />
            <input
              v-model="oldPassword"
              autocomplete="password"
              class="input"
              minlength="3"
              required
              type="password"
            />
          </td>
        </tr>
        <tr>
          <th>New password:</th>
          <td>
            <input
              v-model="newPassword"
              autocomplete="new-password"
              class="input"
              minlength="3"
              name="password"
              required
              type="password"
            />
          </td>
        </tr>
        <tr>
          <th>Confirm password:</th>
          <td>
            <input
              v-model="confirmPassword"
              autocomplete="new-password"
              class="input"
              minlength="3"
              required
              type="password"
            />
          </td>
        </tr>
      </tbody>
      <tr>
        <td colspan="2">
          <app-submit
            :running="running"
            class="green-btn"
            value="Apply Password"
          />
        </td>
      </tr>
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

@Component({
  name: "UserProfileChangePassword",
  components: {AppSubmit},
})
export default class UserProfileChangePassword extends Vue {
  public oldPassword: string = "";

  public newPassword: string = "";

  public confirmPassword: string = "";

  public running: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public get username(): string {
    return this.userInfo.user;
  }

  @ApplyGrowlErr({
    message: "Error changing pass:",
    runningProp: "running",
  })
  public async saveProfile() {
    if (this.newPassword != this.confirmPassword) {
      this.$store.growlError("Passwords don't match");
    } else {
      await this.$api.changePassword(this.oldPassword, this.newPassword);
      this.$store.growlSuccess("Password has been changed");
    }
  }
}
</script>

<style lang="sass" scoped>

</style>
