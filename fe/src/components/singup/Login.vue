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
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from "@/components/ui/AppSubmit.vue"
  import {store} from '@/utils/storeHolder';
  import {login} from "@/utils/utils";
  import SocialAuth from '@/components/singup/SocialAuth.vue';
  import CaptchaComponent from '@/components/singup/CaptchaComponent.vue';

  @Component({components: {CaptchaComponent, SocialAuth, AppSubmit}})
  export default class Register extends Vue {

    $refs: {
      form: HTMLFormElement
    };

    running: boolean = false;

    created() {
      store.setRegHeader('Welcome back!');
    }

    login() {
      this.running = true;
      this.$api.login(this.$refs.form, (session: string, err: string) => {
        this.running = false;
        login(session, err);
      });
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
