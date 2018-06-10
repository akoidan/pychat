<template>
  <form v-on:submit.prevent='login' ref="form">
    <h1>Welcome back!</h1>
    <div>
      <i class='icon-user'></i>
      <input type='text' maxlength='254' required placeholder='Username/Email' name='username'/>
    </div>
    <div>
      <i class='icon-key'></i>
      <input type='password' name='password' placeholder='Password' id='password' required/>
    </div>
    <div class='forg-pass'>
      <router-link :to="{name: 'reset-password'}">Forgot Password?</router-link>
    </div>
    <div>
      <button v-if='oauth_token' class='g-icon lor-btn' title='Sign in using google account'
              onclick='googleLogin'>Via Google
      </button>
      <button v-if='fb_app_id' title='Sign in using facebook account' class='f-icon lor-btn'
              @click='facebookLogin'>
        <i class='icon-facebook-squared'></i>Via Facebook
      </button>
      <submit class='cyan-btn submit-button' value='LOG IN' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from "vue-property-decorator";
  import Submit from "../ui/Submit.vue"
  import {Action} from "vuex-class";

  @Component({components: {Submit}})
  export default class Register extends Vue {

    $refs: {
      form: HTMLFormElement
    }

    @Prop() captcha_key: String;
    @Prop() oauth_token: String;
    @Prop() fb_app_id: String;

    @Action addGrowl;

    running: boolean = false;

    facebookLogin() {
      alert('todo');
    }

    login() {
      this.running = true;
      setTimeout(t => {
        this.running = false;
        this.addGrowl("sucks");
      }, 3000);
    }

  }
</script>
