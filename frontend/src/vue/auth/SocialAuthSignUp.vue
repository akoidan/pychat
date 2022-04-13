<template>
  <div v-if="FACEBOOK_APP_ID || GOOGLE_OAUTH_2_CLIENT_ID">
    <google-auth button-name="Via Google" @token="googleAuth"/>
    <facebook-auth button-name="Via Facebook" @token="facebookAuth"/>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import type {LoginMessage} from "@/ts/types/messages/innerMessages";
import FacebookAuth from "@/vue/auth/FacebookAuth.vue";
import GoogleAuth from "@/vue/auth/GoogleAuth.vue";
import {
  FACEBOOK_APP_ID,
  GOOGLE_OAUTH_2_CLIENT_ID,
} from "@/ts/utils/consts";
import type {OauthSessionResponse} from "@/ts/types/dto";

@Component({
  name: "SocialAuthSignUp",
  components: {
    GoogleAuth,
    FacebookAuth,
  },
})
export default class SocialAuthSignUp extends Vue {
  public readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;

  public readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;

  async googleAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    await this.makeAuth(resolve, reject, this.$api.googleAuth(token));
  }

  async facebookAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    await this.makeAuth(resolve, reject, this.$api.facebookAuth(token));
  }

  async makeAuth(resolve: Function, reject: Function, method: Promise<OauthSessionResponse>) {
    try {
      const oauthSessionResponse = await method;
      if (oauthSessionResponse.isNewAccount) {
        this.$store.growlInfo(`Username ${oauthSessionResponse.username} has been generated while signing up via Social auth. You can change it in UserProfile settings.`);
      }
      const message: LoginMessage = {
        action: "login",
        handler: "router",
        session: oauthSessionResponse.session,
      };
      this.$messageBus.notify(message);
    } catch (e) {
      reject(e);

      return;
    }
    resolve();
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
div
  display: flex
  padding: 5px 0 15px 0
  flex-direction: row
</style>
