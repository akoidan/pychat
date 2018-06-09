<template>
  <form id='regLoginForm' method='post' class='hidden' v-on:submit.prevent='login' ref="form">
    <h1>Welcome back!</h1>
    <div>
      <i class='icon-user'></i>
      <input type='text' maxlength='254' required placeholder='Username/Email' name='username' value=''/>
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
              onclick='googleLogin(event)'>Via Google
      </button>
      <button v-if='fb_app_id' title='Sign in using facebook account' class='f-icon lor-btn'
              @click='facebookLogin'>
        <i class='icon-facebook-squared'></i>Via Facebook
      </button>
      <input type='submit' class='cyan-btn submit-button' value='LOG IN'/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";
  import {xhr} from "../../utils/singletons";

  @Component
  export default class Register extends Vue {

    $refs: {
      form: HTMLFormElement
    }

    @Prop() captcha_key: String;
    @Prop() oauth_token: String;
    @Prop() fb_app_id: String;

    facebookLogin() {
      alert('todo');
    }

    login() {
      xhr.doPost("/auth", null, (data) => {
        alert(data);
      }, new FormData(this.$refs.form));
    }

  }
</script>
