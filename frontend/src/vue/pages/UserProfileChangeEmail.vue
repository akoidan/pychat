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
              class="input"
              minlength="3"
              name="password"
              required
              type="password"
            />
          </td>
        </tr>
        <tr>
          <th>Email:</th>
          <td>
            <input
              v-model="email"
              class="input"
              maxlength="190"
              type="email"
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
import {ApplyGrowlErr, State} from "@/ts/instances/storeInstance";
import {Component, Vue} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {CurrentUserInfoModel} from "@/ts/types/model";

@Component({
  name: "UserProfileChangeEmail",
  components: {AppSubmit},
})
export default class UserProfileChangeEmail extends Vue {
  public password: string = "";

  public email: string = "";

  public running: boolean = false;

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  public created() {
    this.email = this.userInfo.email;
  }

  @ApplyGrowlErr({
    message: "Unable to change email",
    runningProp: "running",
  })
  public async saveProfile() {
    await this.$api.restApi.changeEmailLogin(this.email, this.password);
    this.$store.growlSuccess("Email has been changed");
  }
}
</script>

<style lang="sass" scoped>

</style>
