<template>
  <form @submit.prevent='restorePassword' ref="form">
    <div>
      <input type='text' class="input" required placeholder='Username or email'  name='username_or_password'
             value=''/>
      <div class='slider'>Enter your username or email</div>
    </div>
    <div v-if='captcha_key' ref="repactha" class='g-recaptcha' data-theme='dark' :data-sitekey='captcha_key'></div>
    <div>
      <app-submit class='submit-button' value='Recover password' :running="showRunning"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";
  import AppSubmit from "../ui/AppSubmit.vue"
  import {Action, Mutation} from "vuex-class";

  import { RECAPTCHA_PUBLIC_KEY} from "../../utils/consts";
  import {loadCaptcha} from "../../utils/utils";
  declare const grecaptcha: any;

  @Component({components: {AppSubmit}})
  export default class ResetPassword extends Vue {

    $refs: {
      form: HTMLFormElement;
      repactha: HTMLElement;
    };

    @Mutation setRegHeader;

    captcha_key: string = RECAPTCHA_PUBLIC_KEY;
    @Action growlError;
    @Action growlSuccess;
    running: boolean = false;
    captchaInited: boolean = false;

    get showRunning() {
      return (this.captcha_key && !this.captchaInited) || this.running;
    }

    created() {
      this.logger.debug("initing captcha with key {}", RECAPTCHA_PUBLIC_KEY)();
      this.setRegHeader('Restore password');
      if (this.captcha_key) {
        loadCaptcha( e => {
          this.captchaInited = true;
          if (window['grecaptcha'] &&  grecaptcha.render) {
            this.$nextTick(function () {
              grecaptcha.render(this.$refs.repactha);
            })
          }
        });
      }
    }

    restorePassword(event) {
      this.running = true;
      this.$api.sendRestorePassword(this.$refs.form, error => {
        this.running = false;
        if (window['grecaptcha']) {
          grecaptcha.reset();
        }
        if (error) {
          this.growlError(error);
        } else {
          this.growlSuccess("We send you an reset password email, please follow the instruction in it");
        }
      })
    }


  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"
  @import "partials/abstract_classes"

  .slider
    @extend %slider

  form
    margin-top: 10%
    flex-direction: column
    @include display-flex(!important)
    max-width: 400px
    min-width: 200px
    $height: 70px
    $padding: 20px
    > input
      padding: $padding
      margin:  20px
      display: block
      width: 100%
      height: 50px
      font-size: 20px
    [type=password]
      $dif: $padding * 2
      width: calc(100% - #{$dif})
      height: $height - ($padding + 1) * 2
    [type=submit]
      height: $height

</style>