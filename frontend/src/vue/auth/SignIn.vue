<template>
  <form
    ref="form"
    @submit.prevent="login"
  >
    <div>
      <i class="icon-user"/>
      <input
        autocomplete="username"
        class="input"
        v-model="username"
        maxlength="254"
        name="username"
        placeholder="Username/Email"
        required
        type="text"
      />
    </div>
    <div>
      <i class="icon-key"/>
      <input
        autocomplete="password"
        class="input"
        v-model="password"
        name="password"
        placeholder="Password"
        required
        type="password"
      />
    </div>
    <router-link
      class="forg-pass"
      to="/auth/reset-password"
    >
      Forgot Password?
    </router-link>
    <div>
      <social-auth-sign-up/>
      <captcha-component v-model:loading="running" v-model:token="captcha"/>
      <app-submit
        :running="running"
        class="submit-button"
        value="LOG IN"
      />
    </div>
  </form>
</template>

<script lang='ts'>
import {
  Component,
  Ref,
  Vue,
} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";

import CaptchaComponent from "@/vue/auth/CaptchaComponent.vue";
import type {LoginMessage} from "@/ts/types/messages/innerMessages";
import SocialAuthSignUp from "@/vue/auth/SocialAuthSignUp.vue";

@Component({
  name: "SignIn",
  components: {
    SocialAuthSignUp,
    CaptchaComponent,
    AppSubmit,
  },
})
export default class SignIn extends Vue {
  @Ref()
  public form!: HTMLFormElement;

  public username: string = '';
  public password: string = '';
  public captcha: string = '';
  public running: boolean = false;

  public created() {
    this.$store.setRegHeader("Welcome back!");
  }

  @ApplyGrowlErr({
    runningProp: "running",
    message: "Can't log in",
  })
  public async login() {
    let response;
    if (this.username?.includes('@')) {
      response = await this.$api.signIn({
        email: this.username,
        password: this.password,
        captcha: this.captcha,
      });
    } else {
      response = await this.$api.signIn({
        username: this.username,
        password: this.password,
        captcha: this.captcha,
      });
    }
    const {session} = response;

    const message: LoginMessage = {
      action: "login",
      handler: "router",
      session,
    };
    this.$messageBus.notify(message);
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
