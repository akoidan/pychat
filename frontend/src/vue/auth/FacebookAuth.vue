<template>
  <app-submit
    v-if="fbAppId"
    :running="facebookRunning"
    :value="buttonName"
    class="f-icon lor-btn"
    title="Sign in using facebook account"
    type="button"
    @click.native="facebookLogin"
  />
</template>

<script lang="ts">
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import {Component, Prop, Vue,} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {FACEBOOK_APP_ID} from "@/ts/utils/consts";

declare const FB: any;

let fbInited = false; // This is a global variable

@Component({
  name: "FacebookAuth",
  components: {AppSubmit},
})
export default class FacebookAuth extends Vue {
  public fbAppId: string | false = FACEBOOK_APP_ID;

  public frunning: boolean = false;

  public facebookApiLoaded: boolean = false;

  @Prop()
  public readonly buttonName!: string;

  public get facebookRunning() {
    return this.frunning || !this.facebookApiLoaded;
  }

  public async created() {
    await this.loadFaceBook();
  }

  @ApplyGrowlErr({message: "Unable to load facebook"})
  public async loadFaceBook(): Promise<void> {
    if (!fbInited && FACEBOOK_APP_ID) {
      await this.$api.jsApi.loadFacebook();
      this.$logger.log("Initing facebook sdk...")();
      FB.init({
        appId: FACEBOOK_APP_ID,
        xfbml: true,
        version: "v2.7",
      });
      fbInited = true;
    }

    this.facebookApiLoaded = true;
  }


  @ApplyGrowlErr({
    message: "Unable to login in with facebook",
    runningProp: "frunning",
  })
  public async fbStatusChangeIfReAuth(response: any) {
    this.$logger.debug("fbStatusChangeIfReAuth {}", response)();
    if (response.status === "connected") {
      // Logged into your app and Facebook.
      this.$store.growlInfo("Successfully logged in into facebook, proceeding...");

      /*
       * The code below doesn't return an email. so fb login would be emailess
       * let emailResponse = await new Promise((resolve, reject) => {
       *   FB.api('/me?scope=email', resolve, (a: any,b: any,c: any) => {
       *     console.error(a,b,c)
       *     reject();
       *   })
       * });
       */

      await new Promise((resolve, reject) => {
        this.$emit("token", {
          resolve,
          reject,
          token: response.authResponse.accessToken,
        });
      });

      return false;
    } else if (response.status === "not_authorized") {
      this.frunning = false;
      this.$store.growlInfo("Allow facebook application to use your data");

      return false;
    }
    return true;
  }

  public async facebookLogin() {
    this.frunning = true;

    const response: {status: string} = await new Promise((resolve) => {
      FB.getLoginStatus(resolve);
    });

    this.$logger.log("fbStatusChange {}", response)();
    if (await this.fbStatusChangeIfReAuth(response)) {
      this.$logger.log("Fblogin")();
      const response: {status: string} = await new Promise((resolve, reject) => {
        FB.login(resolve, {
          auth_type: "reauthenticate",
        });
      });
      await this.fbStatusChangeIfReAuth(response);
    }
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

.f-icon
  font: 12px Oswald
  position: relative
  flex-grow: 1

  margin-left: 0
  overflow: hidden

  &:before
    content: ''
    bottom: 0
    // expand to height
    right: 0
    // expand to width
    position: absolute
    background: url('@/assets/img/f-icon.svg') no-repeat
    top: 5px
    left: 10px

  &:active:before
    top: 7px
    left: 12px

</style>
