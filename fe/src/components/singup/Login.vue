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
      <app-submit class='submit-button' value='LOG IN' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from "../ui/AppSubmit.vue"
  import {Action, Mutation} from "vuex-class";
  import {login} from "../../utils/utils";
  import SocialAuth from './SocialAuth';

  @Component({components: {SocialAuth, AppSubmit}})
  export default class Register extends Vue {

    $refs: {
      form: HTMLFormElement
    };

    @Prop() captcha_key: String;

    @Action growlError;
    @Mutation setRegHeader;

    running: boolean = false;

    created() {
      this.setRegHeader('Welcome back!');
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
    color: #249BA3

  .forg-pass
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

  @import "partials/abstract_classes"
  i
    @extend %i
</style>