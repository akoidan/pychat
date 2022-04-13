<template>
  <form
    method="post"
    @submit.prevent="register"
  >
    <register-field-set
      icon="icon-user"
      :validation="userCheckValue"
      :closed="userFoc"
      :description="userDescription"
    >
      <input
        v-model.trim="username"
        v-validity="usernameValidity"
        type="text"
        maxlength="16"
        autocomplete="username"
        required
        placeholder="Username"
        name="username"
        class="input"
        @focus="userFoc = false"
        @blur="userFoc = true"
      />
    </register-field-set>
    <register-field-set
      icon="icon-lock"
      :validation="passwordCheckValue"
      :closed="passwordFoc"
      :description="passwordDescription"
    >
      <input
        v-model="password"
        v-validity="passwordValidity"
        type="password"
        autocomplete="new-password"
        required
        name="password"
        class="input"
        placeholder="Password"
        @focus="passwordFoc = false"
        @blur="passwordFoc = true"
      />
    </register-field-set>
    <register-field-set
      icon="icon-lock"
      :validation="repPassCheckValue"
      :closed="repPassFoc"
      :description="repPassDescription"
    >
      <input
        v-model="repPass"
        v-validity="repPassValidity"
        autocomplete="new-password"
        type="password"
        required
        class="input"
        placeholder="Repeat password"
        @focus="repPassFoc = false"
        @blur="repPassFoc = true"
      />
    </register-field-set>
    <register-field-set
      icon="icon-mail"
      :validation="emailCheckValue"
      :closed="emailFoc"
      :description="emailDescription"
    >
      <input
        v-model.trim="email"
        v-validity="emailValidity"
        type="email"
        autocomplete="email"
        placeholder="Email"
        name="email"
        class="input"
        @focus="emailFoc = false"
        @blur="emailFoc = true"
      />
    </register-field-set>
    <register-field-set
      icon="icon-user-pair"
      :validation="sexCheckValue"
      :closed="sexFoc"
      :description="sexDescription"
    >
      <select
        v-model.trim="sex"
        name="sex"
        class="input"
        @focus="sexFoc = false"
        @blur="sexFoc = true"
      >
        <option
          :value="signUpSexOther"
          disabled
          selected
          hidden
        >
          Gender
        </option>
        <option :value="signUpSexMale">
          Male
        </option>
        <option :value="signUpSexFemale">
          Female
        </option>
      </select>
    </register-field-set>
    <social-auth-sign-up/>
    <app-submit
      class="submit-button"
      value="REGISTER"
      :running="running"
    />
  </form>
</template>

<script lang='ts'>

import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import RegisterFieldSet from "@/vue/auth/RegisterFieldSet.vue";
import debounce from "lodash.debounce";
import {IconColor} from "@/ts/types/types";
import type {LoginMessage} from "@/ts/types/messages/innerMessages";
import SocialAuthSignUp from "@/vue/auth/SocialAuthSignUp.vue";
import {USERNAME_REGEX} from "@/ts/utils/consts";
import {Gender} from '@/ts/types/backend';

@Component({
  name: "SignUp",
  components: {SocialAuthSignUp,
    AppSubmit,
    RegisterFieldSet},
})
export default class SignUp extends Vue {
  @Prop() public oauth_token!: string;

  @Prop() public fb_app_id!: string;

  signUpSexMale = Gender.MALE;
  signUpSexFemale = Gender.FEMALE;
  signUpSexOther = Gender.OTHER;

  running: boolean = false;

  created() {
    this.$store.setRegHeader("Create new account");
    this.debouncedValidateUserName = debounce(this.checkUserName, 500);
    this.debouncedValidateEmail = debounce(this.checkEmail, 500);
  }


  userFoc: boolean = true;

  username: string = "";

  usernameValidity: string = "";

  passwordValidity: string = "";

  repPassValidity: string = "";

  emailValidity: string = "";

  userDescription: string = "Please select username";

  userCheckValue: IconColor = IconColor.NOT_SET;

  debouncedValidateUserName!: Function;


  private currentValidateUsernameRequest: AbortController | null = null;

  async checkUserName(username: string) {
    if (this.currentValidateUsernameRequest) {
      this.currentValidateUsernameRequest.abort();
      this.currentValidateUsernameRequest = null;
    }
    try {
      await this.$api.validateUsername(username, (r: AbortController) => this.currentValidateUsernameRequest = r);
      this.userCheckValue = IconColor.SUCCESS;
      this.userDescription = "Username is ok!";
      this.usernameValidity = "";
    } catch (errors: any) {
      this.userCheckValue = IconColor.ERROR;
      this.usernameValidity = errors;
      this.userDescription = errors;
    } finally {
      this.currentValidateUsernameRequest = null;
    }
  }

  @Watch("username")
  onUsernameChanged(username: string) {
    if (username === "") {
      this.userCheckValue = IconColor.ERROR;
      this.userDescription = "Username can't be empty";
      this.usernameValidity = this.userDescription;
    } else if (!new RegExp(USERNAME_REGEX).test(username)) {
      this.userDescription = "Username can only contain latin letters, numbers, dashes or underscore";
      this.usernameValidity = this.userDescription;
      this.userCheckValue = IconColor.ERROR;
    } else {
      this.usernameValidity = "checking...";
      this.userCheckValue = IconColor.NOT_SET;
      this.debouncedValidateUserName(username);
    }
  }

  passwordFoc: boolean = true;

  password: string = "";

  passwordDescription: string = "Come up with strong password";

  passwordCheckValue: IconColor = IconColor.NOT_SET;

  @Watch("password")
  onPasswordChange(pswd: string) {
    if (pswd.length === 0) {
      this.passwordDescription = "Come up with strong password";
      this.passwordValidity = this.passwordDescription;
      this.passwordCheckValue = IconColor.ERROR;
    } else if (!(/^\S.+\S$/).test(pswd)) {
      this.passwordCheckValue = IconColor.ERROR;
      this.passwordDescription = "Password is too short";
      this.passwordValidity = this.passwordDescription;
    } else if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/).test(pswd) && pswd.length < 11) {
      this.passwordDescription = "Password is weak! Good one contains at least 5 characters, one big letter small letter and a digit";
      this.passwordValidity = "";
      this.passwordCheckValue = IconColor.WARN;
    } else {
      this.passwordDescription = "Password is ok!";
      this.passwordValidity = "";
      this.passwordCheckValue = IconColor.SUCCESS;
    }
  }

  repPassFoc: boolean = true;

  repPass: string = "";

  repPassDescription: string = "Let's check if you remember the password";

  repPassCheckValue: IconColor = IconColor.NOT_SET;

  public get passRepPass() {
    return `${this.repPass}|${this.password}`;
  }

  @Watch("passRepPass")
  onRepPassChange(pswd: string) {
    if (this.repPass != this.password) {
      this.repPassCheckValue = IconColor.ERROR;
      this.repPassDescription = "Passwords don't match";
      this.repPassValidity = this.repPassDescription;
    } else {
      this.repPassCheckValue = IconColor.SUCCESS;
      this.repPassValidity = "";
      this.repPassDescription = "Passwords match";
    }
  }

  emailFoc: boolean = true;

  email: string = "";

  emailDescription: string = "Specify your email. You will be able to join via socials or restore your password later!";

  emailCheckValue: IconColor = IconColor.NOT_SET;

  debouncedValidateEmail!: Function;

  private currentValidateEmailRequest: AbortController | null = null;

  async checkEmail(email: string) {
    if (this.currentValidateEmailRequest) {
      this.currentValidateEmailRequest.abort();
      this.currentValidateEmailRequest = null;
    }
    try {
      await this.$api.validateEmail({email}, (r:AbortController) => this.currentValidateEmailRequest = r);
      this.emailCheckValue = IconColor.SUCCESS;
      this.emailDescription = "Email is ok!";
      this.emailValidity = "";
    } catch (errors: any) {
      this.emailCheckValue = IconColor.ERROR;
      this.emailValidity = errors;
      this.emailDescription = errors;
    } finally {
      this.currentValidateEmailRequest = null;
    }
  }


  destroyed(): void {
    if (this.currentValidateEmailRequest) {
      this.currentValidateEmailRequest.abort();
      this.currentValidateEmailRequest = null;
    }
    if (this.currentValidateUsernameRequest) {
      this.currentValidateUsernameRequest.abort();
      this.currentValidateUsernameRequest = null;
    }
  }


  @Watch("email")
  onEmailChange(email: string) {
    if (email === "") {
      this.emailCheckValue = IconColor.WARN;
      this.emailValidity = "";
      this.userDescription = "Well, it's still fine to leave it blank...";
    } else {
      this.emailCheckValue = IconColor.NOT_SET;
      this.emailValidity = "checking...";
      this.debouncedValidateEmail(email);
    }
  }


  sexFoc: boolean = true;

  sex: string = Gender.OTHER;

  sexDescription: string = "Need a help?";

  sexCheckValue: IconColor = IconColor.NOT_SET;

  @Watch("sex")
  onSexChange(gender: Gender) {
    if (gender == Gender.OTHER) {
      this.sexDescription = "Need a help?";
      this.sexCheckValue = IconColor.WARN;
    } else {
      this.sexCheckValue = IconColor.SUCCESS;
      this.sexDescription = "Gender is ok";
    }
  }

  @ApplyGrowlErr({
    runningProp: "running",
    message: "Can't sign up"
  })
  async register() {
    const {session} = await this.$api.signUp({
      username: this.username,
      password: this.password,
      email: this.email,

    });
    const message: LoginMessage = {
      action: "login",
      handler: "router",
      session
    };
    this.$messageBus.notify(message);
  }
}
</script>
