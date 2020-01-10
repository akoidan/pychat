<template>
  <div>
    <template v-if="captcha_key">
      <template v-if="isIframe">
        <iframe
          ref="iframe"
          :src="ifIframeUrl"
        />
        <input
          type="hidden"
          name="g-recaptcha-response"
          :value="value"
        />
      </template>

      <div
        v-else
        ref="repactha"
        class="g-recaptcha"
        data-theme="dark"
        :data-sitekey="captcha_key"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {
  CAPTCHA_IFRAME,
  PUBLIC_PATH,
  RECAPTCHA_PUBLIC_KEY,
} from "@/utils/consts";
import {GoogleCaptcha} from "@/types/model";

const captchaInited: boolean = false; // Don't init captcha again, if it was inited in another component
let captchaId = 1; // Just random id to diff one comp fro another

@Component
export default class CaptchaComponent extends Vue {
  public captcha_key: string = RECAPTCHA_PUBLIC_KEY || "";

  public captchaInited: boolean = false; // If current component was initialized

  public resettingAllowed: boolean = false; // Prevent resetting on initial load

  public isIframe: boolean = window.location.protocol === "file:";

  @Ref()
  public repactha!: HTMLElement;

  @Ref()
  public iframe!: HTMLIFrameElement;

  public skipInitReset: boolean = true;

  public id = captchaId++;

  @Prop() public value!: boolean;

  private event: ((E: MessageEvent) => void) |null = null;

  private readonly ifIframeUrl: string = CAPTCHA_IFRAME ? `${CAPTCHA_IFRAME}?site_key=${RECAPTCHA_PUBLIC_KEY}` : "";

  @Watch("value")
  public onValueChange(newValue: boolean, oldValue: boolean) {
    if (!newValue && newValue != oldValue) {
      if (this.resettingAllowed) {
        if (this.isIframe && this.iframe) {
          this.logger.log("Resetting captcha")();
          this.iframe.contentWindow!.postMessage("reset-captcha", "*");
        } else {
          this.grecaptcha.reset && this.grecaptcha.reset();
        }
      }
      this.resettingAllowed = true;
    }
    this.skipInitReset = false;
  }

  get grecaptcha(): GoogleCaptcha {
    if (window.grecaptcha) {
      return window.grecaptcha;
    }
    return {
      render: () => {},
      reset: () => {},
    };
  }

  public renderCaptcha() {
    this.$emit("input", false);
    this.captchaInited = true;
  }

  public destroyed(): void {
    if (this.event) {
      this.logger.log("Removing message listener {}", this.event)();
      window.removeEventListener("message", this.event);
      this.event = null;
    }
  }

  public async created() {
    this.logger.debug("initing captcha with key {}", RECAPTCHA_PUBLIC_KEY)();
    if (this.captcha_key) {
      if (this.isIframe) {
        this.logger.log("Adding message listener")();
        this.event = (event: MessageEvent) => {
          this.logger.log("On message {}", event)();
          if (event.data && event.data["g-recaptcha-response"]) {
            this.captchaInited = true;
            this.value = event.data["g-recaptcha-response"]; // TODO emitting prop
          }
        };
        window.addEventListener("message", this.event, false);
      } else if (captchaInited) {
        this.renderCaptcha();
      } else {
        this.$emit("input", true);
        await this.$api.loadRecaptcha();
        this.renderCaptcha();
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

