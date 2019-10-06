<template>
    <div>
        <template v-if='captcha_key'>
            <template v-if="isIframe" >
                <iframe :src="ifIframeUrl" ref="iframe">

                </iframe>
                <input type="hidden" name="g-recaptcha-response" :value="value"/>
            </template>

            <div v-else
                 ref="repactha"
                 class='g-recaptcha'
                 data-theme='dark'
                 :data-sitekey='captcha_key'
            />
        </template>

    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {
    RECAPTCHA_PUBLIC_KEY,
    PUBLIC_PATH,
    CAPTCHA_IFRAME
  } from "@/utils/consts";
  import {GoogleCaptcha} from "@/types/model";

  let captchaInited: boolean = false; // don't init captcha again, if it was inited in another component
  let captchaId = 1; // just random id to diff one comp fro another

  @Component
  export default class CaptchaComponent extends Vue {

    captcha_key: string = RECAPTCHA_PUBLIC_KEY || '';
    captchaInited: boolean = false;  // if current component was initialized
    resettingAllowed: boolean = false; // prevent resetting on initial load
    isIframe: boolean = window.location.protocol === "file:";
    $refs: {
      repactha: HTMLElement;
      iframe: HTMLIFrameElement;
    };

    skipInitReset: boolean = true;
    id = captchaId++;


    @Prop() value;
    private event: (E: MessageEvent) => any = null;

    private ifIframeUrl: string = `${CAPTCHA_IFRAME}?site_key=${RECAPTCHA_PUBLIC_KEY}`;


    @Watch('value')
    onValueChange(newValue, oldValue) {
      if (!newValue && newValue != oldValue) {
        if (this.resettingAllowed) {
          if (this.isIframe && this.$refs.iframe) {
            this.logger.log("Resetting captcha")();
            this.$refs.iframe.contentWindow.postMessage('reset-captcha', '*');
          } else {
            this.grecaptcha.reset && this.grecaptcha.reset();
          }
        }
        this.resettingAllowed = true;
      }
      this.skipInitReset = false;
    }

    get grecaptcha(): GoogleCaptcha {
      if (grecaptcha) {
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

    destroyed(): void {
      if (this.event ){
        this.logger.log("Removing message listener {}", this.event)();
        window.removeEventListener('message', this.event);
        this.event = null;
      }
    }


    created() {
      this.logger.debug("initing captcha with key {}", RECAPTCHA_PUBLIC_KEY)();
      if (this.captcha_key) {
        if (this.isIframe) {
          this.logger.log("Adding message listener")();
          this.event =  (event: MessageEvent) => {
            this.logger.log("On message {}", event)();
            if (event.data && event.data['g-recaptcha-response']) {
              this.captchaInited = true;
              this.value = event.data['g-recaptcha-response'];
            }
          };
          window.addEventListener('message', this.event, false);
        } else {
          if (captchaInited) {
            this.renderCaptcha();
          } else {
            this.$emit('input', true);
            this.$api.loadRecaptcha(() => this.renderCaptcha());
          }
        }
      }
    }
  }
</script>
<style lang="sass" scoped>
    iframe
        width: 320px
        border: none
        height: 500px

</style>

