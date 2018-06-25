<template>
  <form @submit.prevent='login' ref="form">
    <div>
      <i class='icon-user'></i>
      <input type='text' maxlength='254' class="input" required placeholder='Username/Email' name='username'/>
    </div>
    <div>
      <i class='icon-key'></i>
      <input type='password' name='password' class="input" placeholder='Password' required/>
    </div>
      <router-link class='forg-pass' to="/auth/reset-password">Forgot Password?</router-link>
    <div>
      <button v-if='oauth_token' class='g-icon lor-btn' title='Sign in using google account'
              onclick='googleLogin'>Via Google
      </button>
      <button v-if='fb_app_id' title='Sign in using facebook account' class='f-icon lor-btn'
              @click='facebookLogin'>
        <i class='icon-facebook-squared'></i>Via Facebook
      </button>
      <app-submit class='submit-button' value='LOG IN' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from "../ui/AppSubmit.vue"
  import {Action, Mutation} from "vuex-class";
  import {login} from "../../utils/utils";

  @Component({components: {AppSubmit}})
  export default class Register extends Vue {

    $refs: {
      form: HTMLFormElement
    };

    @Prop() captcha_key: String;
    @Prop() oauth_token: String;
    @Prop() fb_app_id: String;

    @Action growlError;
    @Mutation setRegHeader;

    running: boolean = false;

    facebookLogin() {
      alert('todo');
    }

    created() {
      this.setRegHeader('Welcome back!');
    }

    login() {
      this.running = true;
      this.$api.login(this.$refs.form, (session, err) => {
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