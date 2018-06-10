<template>
  <form id='recoverForm' v-on:submit.prevent='restorePassword' ref="form">
    <div>
      <input type='text' required placeholder='Username or email' class='username-or-pass' name='username_or_password'
             value=''/>
      <div class='slider'>Enter your username or email</div>
    </div>
    <div v-if='captcha_key' class='g-recaptcha' data-theme='dark' :data-sitekey='captcha_key'></div>
    <div>
      <input type='submit' class='cyan-btn submit-button' value='Recover password'/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";
  import {xhr} from "../../utils/singletons";
  import {Mutation} from "vuex-class";

  @Component
  export default class ResetPassword extends Vue {

    $refs: {
      form: HTMLFormElement
    }
    @Mutation setRegHeader;

    @Prop() captcha_key: String;


    created() {
      this.setRegHeader('Restore password');
    }

    register() {
      xhr.doPost("/register", null, (res) => {
        alert("works");
      });
    }

    restorePassword(event) {

      xhr.doPost("/send_restore_password", null, (data) => {
        alert('asd');
      }, new FormData(this.$refs.form));
    }


  }
</script>
