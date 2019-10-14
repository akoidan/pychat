<template>
  <form @submit.prevent='login' ref="form">
    <div>
      <i class='icon-user'></i>
      <input type='text' maxlength='254' class="input" autocomplete="username" required placeholder='Username/Email' name='username'/>
    </div>
    <div>
      <i class='icon-key'></i>
      <input type='password' name='password' autocomplete="password" class="input" placeholder='Password' required/>
    </div>
      <router-link class='forg-pass' to="/auth/reset-password">Forgot Password?</router-link>
    <div>
      <social-auth/>
      <captcha-component v-model="running"/>
      <app-submit class='submit-button' value='LOG IN' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Ref} from "vue-property-decorator";
  import AppSubmit from "@/components/ui/AppSubmit"
  import {State} from '@/utils/storeHolder';
  import {ApplyGrowlErr, login} from '@/utils/utils';
  import SocialAuth from '@/components/singup/SocialAuth';
  import CaptchaComponent from '@/components/singup/CaptchaComponent';

  @Component({components: {CaptchaComponent, SocialAuth, AppSubmit}})
  export default class Login extends Vue {

    @Ref()
    form!: HTMLFormElement;

    running: boolean = false;

    created() {
      this.store.setRegHeader('Welcome back!');
    }

    @ApplyGrowlErr({runningProp: 'running', message: `Can't log in`})
    async login() {
      let ses: string = await this.$api.login(this.form);
      login(ses)
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

  @import "~@/assets/sass/partials/abstract_classes"
  i
    @extend %i
</style>
