<template>
  <div>
    <template v-if="captchaKey">
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

const captchaInited = ref(false);

let captchaId = 1; // Just random id to diff one comp from another

window.onloadrecaptcha = function () {
  captchaInited.value = true;
};

@Component({name: "CaptchaComponent"})
export default class CaptchaComponent extends Vue {
  public captchaKey: string = RECAPTCHA_PUBLIC_KEY || "";

  public resettingAllowed: boolean = false; // Prevent resetting on initial load

  public isIframe: boolean = window.location.protocol === "file:";

  @Ref()
  public repactha!: HTMLElement;

  @Ref()
  public iframe!: HTMLIFrameElement;

  public id = captchaId++;

  @Prop() public loading!: boolean;

  @Prop() public token!: string;

  public ifIframeUrl: string = CAPTCHA_IFRAME ? `${CAPTCHA_IFRAME}?site_key=${RECAPTCHA_PUBLIC_KEY}` : "";

  private event: ((E: MessageEvent) => void) | null = null;

  public get grecaptcha(): GoogleCaptcha {
    return {
      render: (...args) => {
        if (this.isIframe && this.iframe) {
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
        } else if ((window as any).grecaptcha?.render) {
          this.grecaptcha.render(...args);
        }
      },
      reset: (...args) => {
        if (this.isIframe && this.iframe) {
          this.$logger.log("Resetting captcha")();
          this.iframe.contentWindow!.postMessage("reset-captcha", "*");
        } else if ((window as any).grecaptcha?.reset) {
          this.grecaptcha.reset(...args);
        }
      },
    };
  }

  @Watch("loading")
  public onValueChange(newValue: boolean, oldValue: boolean) {
    this.$logger.log("loading change {}", {
      newValue,
      oldValue,
      resettingAllowed: this.resettingAllowed,
    })();
    if (!newValue && newValue != oldValue) {
      if (this.resettingAllowed) {
        this.grecaptcha.reset();
      }
      this.resettingAllowed = true;
    }
  }


  public renderCaptcha() {
    this.$emit("update:loading", false);
    this.grecaptcha.render(this.repactha, {
      sitekey: this.captchaKey,
      theme: "dark",
      callback: (response: string) => {
        this.$emit("update:token", response);
      },
    });
    captchaInited.value = true;
  }

  public destroyed(): void {
    // Always reset captcha, otherwise next component which assumes that captcha is not confirmed will fail
    this.grecaptcha.reset();
    if (this.event) {
      this.$logger.log("Removing message listener {}", this.event)();
      window.removeEventListener("message", this.event);
      this.event = null;
    }
  }

  get captchaInited() {
    return captchaInited.value;
  }

  @Watch("captchaInited")
  public async oncatpchaChange() {
    if (captchaInited.value) {
      this.renderCaptcha();
    }
  }

  public async mounted() { // Should be mounted thus div to render recaptcha exists
    this.$logger.debug("initing captcha with key {}", this.captchaKey)();
    if (this.captchaKey) {
      if (this.isIframe || captchaInited.value) {
        this.renderCaptcha();
      } else {
        this.$emit("update:loading", true);
        await this.$api.loadRecaptcha("onloadrecaptcha");
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

