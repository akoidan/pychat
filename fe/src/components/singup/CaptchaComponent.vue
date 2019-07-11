<template>
    <div>
        <div v-if='captcha_key' ref="repactha" class='g-recaptcha' data-theme='dark' :data-sitekey='captcha_key'></div>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {RECAPTCHA_PUBLIC_KEY} from "../../utils/consts";
  import {GoogleCaptcha} from "../../types/model";

  let captchaInited: boolean = false; // don't init captcha again, if it was inited in another component
  let captchaId = 1; // just random id to diff one comp fro another

  @Component
  export default class CaptchaComponent extends Vue {

    captcha_key: string = RECAPTCHA_PUBLIC_KEY || '';
    captchaInited: boolean = false;  // if current component was initialized
    resettingAllowed: boolean = false; // prevent resetting on initial load

    $refs: {
      repactha: HTMLElement;
    };

    skipInitReset: boolean = true;
    id = captchaId++;

    @Prop() value;


    @Watch('value')
    onValueChange(newValue, oldValue) {
      if (!newValue && newValue != oldValue) {
        if (this.resettingAllowed) {
          this.logger.log("Resetting captcha")();
          this.grecaptcha.reset && this.grecaptcha.reset();
        }
        this.resettingAllowed = true;
      }
      this.skipInitReset = false;
    }


    get grecaptcha(): GoogleCaptcha {
      if (window.grecaptcha) {
        return window.grecaptcha;
      } else {
        return {
            render: () => {},
            reset: () => {},
        }
      }
    }

    renderCaptcha() {
      this.$emit("input", false);
      this.captchaInited = true;
    }


    created() {
      this.logger.debug("initing captcha with key {}", RECAPTCHA_PUBLIC_KEY)();
      if (this.captcha_key) {
        if (captchaInited) {
          this.renderCaptcha();
        } else {
          this.$emit('input', true);
          this.$api.loadRecaptcha(() => this.renderCaptcha());
        }
      }
    }
  }
</script>
<style lang="sass" scoped>


</style>

