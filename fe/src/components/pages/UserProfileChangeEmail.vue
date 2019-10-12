<template>
  <form @submit.prevent="saveProfile" class="holder" method="post">
    <table>
      <tbody>
      <tr>
        <th>Enter your password:</th>
        <td>
          <input autocomplete="password" required class="input" type="password" name="password" minlength="3" v-model="password">
        </td>
      </tr>
      <tr>
        <th>Email:</th>
        <td><input maxlength="190" class="input" v-model="email" type="email"></td>
      </tr>
      </tbody>
      <tr><td colspan="2">
        <app-submit class="green-btn" value='Apply Password' :running="running"/>
      </td></tr>
    </table>
  </form>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from '@/components/ui/AppSubmit';
  import {CurrentUserInfoModel} from "@/types/model";
  @Component({
    components: {AppSubmit}
  })
  export default class UserProfileChangeEmail extends Vue {

    password: string = '';
    email: string = '';
    running: boolean = false;



    @State
    public readonly userInfo!: CurrentUserInfoModel;


    created() {
      this.email = this.userInfo.email;
    }

    saveProfile() {
      this.running = true;
      this.$api.changeEmailLogin(this.email,this.password, (e) => {
        this.running = false;
        if (e) {
          this.store.growlError(e)
        } else {
          this.store.growlSuccess("Email has been changed");
        }
      });
    }
  }
</script>

<style lang="sass" scoped>

</style>
