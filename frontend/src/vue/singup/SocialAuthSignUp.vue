<template>
  <div v-if="FACEBOOK_APP_ID && GOOGLE_OAUTH_2_CLIENT_ID">
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

@Component({
  components: {GoogleAuth, FacebookAuth}
})
export default class SocialAuthSignUp extends Vue {

  private readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;
  private readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;

  async googleAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    let session: string|undefined;
    try {
      session = await this.$api.googleAuth(token);
      let message: LoginMessage = {action: 'login', handler: 'router', session};
      sub.notify(message); // sub should be here, since we it throws an expection if session is an error that we show later in growl
    } catch (e) {
      reject(e);

      return;
    }
    resolve();
  }

  async facebookAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    let session: string|undefined;
    try {
      session = await this.$api.facebookAuth(token);
      let message: LoginMessage = {action: 'login', handler: 'router', session};
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