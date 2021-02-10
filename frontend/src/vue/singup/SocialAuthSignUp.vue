<template>
  <div v-if="FACEBOOK_APP_ID || GOOGLE_OAUTH_2_CLIENT_ID">
    <google-auth @token="googleAuth" button-name="Via Google"/>
    <facebook-auth @token="facebookAuth" button-name="Via Facebook"/>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue
} from "vue-property-decorator";
import { LoginMessage } from '@/ts/types/messages/innerMessages';
import { sub } from '@/ts/instances/subInstance';
import FacebookAuth from '@/vue/singup/FacebookAuth.vue';
import GoogleAuth from '@/vue/singup/GoogleAuth.vue';
import { GOOGLE_OAUTH_2_CLIENT_ID, FACEBOOK_APP_ID } from "@/ts/utils/consts";
import { OauthSessionResponse } from '@/ts/types/dto';

@Component({
  name: 'SocialAuthSignUp' ,
  components: {GoogleAuth, FacebookAuth}
})
export default class SocialAuthSignUp extends Vue {

  private readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;
  private readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;

  async googleAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    await this.makeAuth(resolve, reject, this.$api.googleAuth(token));
  }

  async facebookAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    await this.makeAuth(resolve, reject, this.$api.facebookAuth(token));
  }

  async makeAuth(resolve: Function, reject: Function, method: Promise<OauthSessionResponse>) {
    try {
      let oauthSessionResponse = await method;
      if (oauthSessionResponse.isNewAccount) {
        this.$store.growlInfo(`Username ${oauthSessionResponse.username} has been generated while signing up via Social auth. You can change it in UserProfile settings.`);
      }
      let message: LoginMessage = {action: 'login', handler: 'router', session: oauthSessionResponse.session};
      sub.notify(message);
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
