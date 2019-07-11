<template>
  <form @submit.prevent="saveProfile" class="holder" method="post">
    <table>
      <tbody>
      <tr>
        <th>Old password:</th>
        <td>
          <input type="text" name="username" autocomplete="username" v-model="username" v-show="false"/>
          <input autocomplete="password" class="input" minlength="3" required type="password" v-model="oldPassword">
        </td>
      </tr>
      <tr>
        <th>New password:</th>
        <td>
          <input autocomplete="new-password" required class="input" type="password" name="password" minlength="3" v-model="newPassword">
        </td>
      </tr>
      <tr>
        <th>Confirm password:</th>
        <td><input autocomplete="new-password" required class="input" type="password" minlength="3" v-model="confirmPassword"></td>
      </tr>
      </tbody>
      <tr><td colspan="2">
        <app-submit class="green-btn" value='Apply Password' :running="running"/>
      </td></tr>
    </table>
  </form>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from '../ui/AppSubmit';
  import {CurrentUserInfoModel} from "../../types/model";
  @Component({
    components: {AppSubmit}
  })
  export default class UserProfileChangePassword extends Vue {

    oldPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = "";
    username: string;
    running: boolean = false;
    @Action growlError;
    @Action growlSuccess;

    @State userInfo: CurrentUserInfoModel;

    created() {
      this.username = this.userInfo.user;
    }

    saveProfile() {
      if (this.newPassword != this.confirmPassword) {
        this.growlError("Passwords don't match");
      } else {
        this.running = true;
        this.$api.changePassword(this.oldPassword, this.newPassword, e => {
          this.running = false;
          if (e) {
            this.growlError(e)
          } else {
            this.growlSuccess("Password has been changed");
          }
        });
      }
    }
  }
</script>

<style lang="sass" scoped>

</style>
