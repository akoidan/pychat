<template>
  <div>
    <template v-if="captcha_key">
      <template v-if="isIframe">
        <iframe
          ref="iframe"
          :src="ifIframeUrl"
        />
        <input
          :value="token"
          name="g-recaptcha-response"
          type="hidden"
        />
      </template>

      <div
        v-else
        ref="repactha"
        class="g-recaptcha"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {
  CAPTCHA_IFRAME,
  RECAPTCHA_PUBLIC_KEY,
} from "@/ts/utils/consts";
import type {GoogleCaptcha} from "@/ts/types/model";
import {ref} from "vue";

const captchaInited = ref(false)

let captchaId = 1; // Just random id to diff one comp fro another

window.onloadrecaptcha = function () {
  captchaInited.value = true;
}

@Component({name: "CaptchaComponent"})
export default class CaptchaComponent extends Vue {
  public captcha_key: string = RECAPTCHA_PUBLIC_KEY || "";

  public resettingAllowed: boolean = false; // Prevent resetting on initial load

  public isIframe: boolean = window.location.protocol === "file:";

  @Ref()
  public repactha!: HTMLElement;

  @Ref()
  public iframe!: HTMLIFrameElement;

  public skipInitReset: boolean = true;

  public id = captchaId++;

  @Prop() public loading!: boolean;

  @Prop() public token!: string;

  public ifIframeUrl: string = CAPTCHA_IFRAME ? `${CAPTCHA_IFRAME}?site_key=${RECAPTCHA_PUBLIC_KEY}` : "";

  private event: ((E: MessageEvent) => void) | null = null;

  public get grecaptcha(): GoogleCaptcha {
    if (window.grecaptcha && (window.grecaptcha as any).reset) {
      return window.grecaptcha;
    }
    return {
      render: () => {
      },
      reset: () => {
      },
    };
  }

  @Watch("loading")
  public onValueChange(newValue: boolean, oldValue: boolean) {
    if (!newValue && newValue != oldValue) {
      if (this.resettingAllowed) {
        if (this.isIframe && this.iframe) {
          this.$logger.log("Resetting captcha")();
          this.iframe.contentWindow!.postMessage("reset-captcha", "*");
        } else {
          this.grecaptcha.reset();
        }
      }
      this.resettingAllowed = true;
    }
    this.skipInitReset = false;
  }



  public renderCaptcha() {
    this.$emit("update:loading", false);
    this.grecaptcha.render(this.repactha, {
      sitekey: this.captcha_key,
      theme: 'dark',
      callback: (response: string) => this.$emit("update:token", response),
    })
    captchaInited.value = true
  }

  public destroyed(): void {
    if (this.event) {
      this.$logger.log("Removing message listener {}", this.event)();
      window.removeEventListener("message", this.event);
      this.event = null;
    }
  }

  get captchaInited() {
    return captchaInited.value;
  }

  @Watch('captchaInited')
  public async oncatpchaChange() {
    if (captchaInited.value) {
      this.renderCaptcha();
    }
  }

  public async created() {
    this.$logger.debug("initing captcha with key {}", RECAPTCHA_PUBLIC_KEY)();
    if (this.captcha_key) {
      if (this.isIframe) {
        this.$logger.log("Adding message listener")();
        this.event = (event: MessageEvent) => {
          this.$logger.log("On message {}", event)();
          if (event.data && event.data["g-recaptcha-response"]) {
            captchaInited.value = true;
            this.$emit("update:loading", true);
            this.$emit("update:token", event.data["g-recaptcha-response"]);
          }
        };
        window.addEventListener("message", this.event, false);
      } else if (captchaInited.value) {
        this.renderCaptcha();
      } else {
        this.$emit("update:loading", true);
        await this.$api.loadRecaptcha('onloadrecaptcha');
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

