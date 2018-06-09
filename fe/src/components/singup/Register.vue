<template>
  <form id='register-form' method='post' v-on:submit.prevent='register'>
    <h1>Create new account</h1>
    <div class='required'>
      <i class='icon-user'></i>
      <input type='text' maxlength='16' required placeholder='Username' name='username' value='' id='rusername'/>
      <div class='slider closed'></div>
    </div>
    <div class='required'>
      <i class='icon-lock'></i>
      <input type='password' required name='password' value=''
             id='rpassword' placeholder='Password'/>
      <div class='slider closed'></div>
    </div>
    <div class='required'>
      <i class='icon-lock'></i>
      <input type='password' required name='repeatpassword' value='' placeholder='Confirm password'
             id='repeatpassword'/>
      <div class='slider closed'></div>
    </div>
    <div>
      <i class='icon-mail'></i>
      <input type='email' placeholder='Email' name='email' value='' id='email'/>
      <div class='slider closed'></div>
    </div>
    <div>
      <i class='icon-user-pair'></i>
      <select id='id_sex' name='sex'>
        <option value='Secret' disabled selected hidden>Gender</option>
        <option value='Male'>Male</option>
        <option value='Female'>Female</option>
      </select>
      <div class='slider closed'></div>
    </div>
    <button v-if='oauth_token' class='g-icon lor-btn' title='Sign up using google account'
            @click='googleLogin'>With Google
    </button>
    <button v-if='fb_app_id' title='Sign up using facebook account' class='f-icon lor-btn'
            @click='facebookLogin'>
      <i class='icon-facebook-squared'></i>With Facebook
    </button>
    <input type='submit' class='cyan-btn submit-button' value='REGISTER'/>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from 'vue-property-decorator';
  import {xhr} from '../../utils/singletons';

  @Component
  export default class Register extends Vue {

    @Prop() captcha_key: String;
    @Prop() oauth_token: String;
    @Prop() fb_app_id: String;

    facebookLogin() {
      alert('TODO');
    }

    googleLogin() {
      alert('TODO');
    }

    register() {
      xhr.doPost('/register', null, (res) => {
        alert(res);
      });
    }

  }
</script>
