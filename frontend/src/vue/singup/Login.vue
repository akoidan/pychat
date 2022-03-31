<template>
  <form
    ref="form"
    @submit.prevent="login"
  >
    <div>
      <i class="icon-user" />
      <input
        type="text"
        maxlength="254"
        class="input"
        autocomplete="username"
        required
        placeholder="Username/Email"
        name="username"
      >
    </div>
    <div>
      <i class="icon-key" />
      <input
        type="password"
        name="password"
        autocomplete="password"
        class="input"
        placeholder="Password"
        required
      >
    </div>
    <router-link
      class="forg-pass"
      to="/auth/reset-password"
    >
      Forgot Password?
    </router-link>
    <div>
      <social-auth-sign-up/>
      <captcha-component v-model="running" />
      <app-submit
        class="submit-button"
        value="LOG IN"
        :running="running"
      />
    </div>
  </form>
</template>

<script lang='ts'>
import {Component, Prop, Vue, Ref} from 'vue-property-decorator';
import AppSubmit from '@/vue/ui/AppSubmit';
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';

import CaptchaComponent from '@/vue/singup/CaptchaComponent';
import {sub} from '@/ts/instances/subInstance'
import { LoginMessage } from '@/ts/types/messages/innerMessages';
import SocialAuthSignUp from '@/vue/singup/SocialAuthSignUp';

@Component({
  name: 'Login' ,
  components: {SocialAuthSignUp, CaptchaComponent, AppSubmit}
})
export default class Login extends Vue {

  @Ref()
  public form!: HTMLFormElement;

  public running: boolean = false;

  public created() {
    this.$store.setRegHeader('Welcome back!');
  }

  @ApplyGrowlErr({runningProp: 'running', message: `Can't log in`})
  public async login() {
    const {session} = await this.$api.login(this.form);
    let message: LoginMessage = {action: 'login', handler: 'router', session};
    sub.notify(message)
  }

}
</script>
<style lang="sass" scoped>

  .forg-pass
    display: block
    color: #249BA3
    text-align: right
    font: 12px Open Sans
    padding-right: 10px
    width: inherit
    padding-top: 3px
    padding-bottom: 5px
    text-shadow: #000 0 1px 5px
    &:hover
      text-decoration: underline
      cursor: pointer

  @import "@/assets/sass/partials/abstract_classes"
  i
    @extend %i
</style>
