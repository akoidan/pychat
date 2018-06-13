<template>
  <form id='register-form' method='post' @submit.prevent='register'>
    <register-field-set icon="icon-user" :validation="userCheckValue" :closed="userFoc" :description="userDescription" >
      <input type='text' maxlength='16' required placeholder='Username' ref="username" v-model.trim="username" name='username' class="input" @focus="userFoc = false" @blur="userFoc = true"/>
    </register-field-set>
    <register-field-set icon="icon-lock" :validation="passwordCheckValue" :closed="passwordFoc" :description="passwordDescription" >
      <input ref="password" type='password' required name='password' class="input" placeholder='Password'  @focus="passwordFoc = false"  v-model="password" @blur="passwordFoc = true"/>
    </register-field-set>
    <register-field-set icon="icon-lock" :validation="repPassCheckValue" :closed="repPassFoc" :description="repPassDescription" >
      <input ref="repPass" type='password' required name='repPass' class="input" placeholder='Repeat password'  @focus="repPassFoc = false"  v-model="repPass" @blur="repPassFoc = true"/>
    </register-field-set>
    <register-field-set icon="icon-mail" :validation="emailCheckValue" :closed="emailFoc" :description="emailDescription" >
      <input type='email' ref="email" placeholder='Email' name='email' class="input" @focus="emailFoc = false"  v-model.trim="email" @blur="emailFoc = true"/>
    </register-field-set>
    <register-field-set icon="icon-user-pair" :validation="sexCheckValue" :closed="sexFoc" :description="sexDescription">
      <select ref="sex" name='sex' class="input" @focus="sexFoc = false" v-model.trim="sex" @blur="sexFoc = true">
        <option value='Secret' disabled selected hidden>Gender</option>
        <option value='Male'>Male</option>
        <option value='Female'>Female</option>
      </select>
    </register-field-set>

    <button v-if='oauth_token' class='g-icon lor-btn' title='Sign up using google account'
            @click='googleLogin'>With Google
    </button>
    <button v-if='fb_app_id' title='Sign up using facebook account' class='f-icon lor-btn'
            @click='facebookLogin'>
      <i class='icon-facebook-squared'></i>With Facebook
    </button>
    <app-submit class='submit-button' value='REGISTER' :running="running"/>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop, Watch} from "vue-property-decorator";
  import {api, xhr} from "../../utils/singletons";
  import {Mutation} from "vuex-class";
  import AppSubmit from "../ui/AppSubmit.vue"
  import RegisterFieldSet from './RegisterFieldSet.vue'
  import _ from 'lodash';
  import {IconColor} from './types';

  @Component({components: {AppSubmit, RegisterFieldSet}})
  export default class Register extends Vue {

    @Prop() captcha_key: string;
    @Prop() oauth_token: string;
    @Prop() fb_app_id: string;
    @Mutation setRegHeader;

    running: boolean = false;

    $refs: {
      form: HTMLFormElement,
      username: HTMLInputElement,
      password: HTMLInputElement,
      repPass: HTMLInputElement,
      email: HTMLInputElement,
    };

    created() {
      this.setRegHeader('Create new account');
      this.debouncedValidateUserName = _.debounce(this.checkUserName, 500);
      this.debouncedValidateEmail = _.debounce(this.checkEmail, 500);
    }


    userFoc: boolean = true;
    username: string = "";
    userDescription: string = 'Please select username';
    userCheckValue: IconColor = IconColor.NOT_SET;
    debouncedValidateUserName: Function;


    checkUserName(username: string) {
      api.validateUsername(username, errors => {
        this.userCheckValue = errors ? IconColor.ERROR : IconColor.SUCCESS;
        this.$refs.username.setCustomValidity(errors ? errors : "");
        this.userDescription = errors ? errors : `Username ${username} is available`;
      });
    }

    @Watch('username')
    onUsernameChanged(username: string) {
      if (username === "") {
        this.userCheckValue = IconColor.ERROR;
        this.userDescription = "Username can't be empty";
        this.$refs.username.setCustomValidity(this.userDescription);
      } else if (!/^[a-zA-Z-_0-9]{1,16}$/.test(username)) {
        this.userDescription = "Username can only contain latin letters, numbers, dashes or underscore";
        this.$refs.username.setCustomValidity(this.userDescription);
        this.userCheckValue = IconColor.ERROR;
      } else {
        this.$refs.username.setCustomValidity("checking...");
        this.userCheckValue = IconColor.NOT_SET;
        this.debouncedValidateUserName(username)
      }
    }

    passwordFoc: boolean = true;
    password: string = "";
    passwordDescription: string = 'Come up with strong password';
    passwordCheckValue: IconColor = IconColor.NOT_SET;

    @Watch('password')
    onPasswordChange(pswd: string) {
      if (pswd.length === 0) {
        this.passwordDescription = 'Come up with strong password';
        this.$refs.password.setCustomValidity(this.passwordDescription);
        this.passwordCheckValue = IconColor.ERROR;
      } else if (!/^\S.+\S$/.test(pswd)) {
        this.passwordCheckValue = IconColor.ERROR;
        this.passwordDescription = "Password is too short";
        this.$refs.password.setCustomValidity(this.passwordDescription);
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/.test(pswd) && pswd.length < 11) {
        this.passwordDescription = "Password is weak! Good one contains at least 5 characters, one big letter small letter and a digit";
        this.$refs.password.setCustomValidity("");
        this.passwordCheckValue = IconColor.WARN;
      } else {
        this.passwordDescription = "Password is good!";
        this.$refs.password.setCustomValidity("");
        this.passwordCheckValue = IconColor.SUCCESS;
      }
    }

    repPassFoc: boolean = true;
    repPass: string = "";
    repPassDescription: string = "Let's check if you remember the password";
    repPassCheckValue: IconColor = IconColor.NOT_SET;

    get passRepPass () {
      return `${this.repPass}|${this.password}`
    }
    @Watch('passRepPass')
    onRepPassChange(pswd: string) {
      if (this.repPass != this.password) {
        this.repPassCheckValue = IconColor.ERROR;
        this.repPassDescription = "Passwords don't match"
        this.$refs.repPass.setCustomValidity(this.repPassDescription);
      } else {
        this.repPassCheckValue = IconColor.SUCCESS;
        this.$refs.repPass.setCustomValidity("");
        this.repPassDescription = "Passwords match";
      }
    }

    emailFoc: boolean = true;
    email: string = "";
    emailDescription: string = 'Specify your email. You will be able to join via socials or restore your password later!';
    emailCheckValue: IconColor = IconColor.NOT_SET;
    debouncedValidateEmail: Function;

    checkEmail(username: string) {
      console.log('asd');
      api.validateEmail(username, errors => {
        this.emailCheckValue = errors ? IconColor.ERROR : IconColor.SUCCESS;
        this.$refs.email.setCustomValidity(errors ? errors : "");
        this.emailDescription = errors ? errors : `Email ${username} is not registered`;
      });
    }

    @Watch('email')
    onEmailChange(email: string) {
      if (email === "") {
        this.emailCheckValue = IconColor.WARN;
        this.$refs.email.setCustomValidity("");
        this.userDescription = "Well, it's still fine to leave it blank...";
      } else {
        this.emailCheckValue = IconColor.NOT_SET;
        this.$refs.email.setCustomValidity("checking...");
        this.debouncedValidateEmail(email)
      }
    }


    sexFoc: boolean = true;
    sex: string = "";
    sexDescription: string = 'Are you sure about your gender?';
    sexCheckValue: IconColor = IconColor.NOT_SET;

    @Watch('sex')
    onSexChange(gender: string) {
      if (gender == 'Secret') {
        this.sexDescription = `Need a help?`;
        this.sexCheckValue = IconColor.WARN;
      } else {
        this.sexCheckValue = IconColor.SUCCESS;
        this.sexDescription = "Well, let's hope you are being serious...";
      }
    }


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
<style lang="sass" scoped>
  @import "partials/mixins"

  select.input
    border-radius: 5px
    margin-bottom: 10px
    font-size: 13px
    width: 100%


  @import "register"
</style>