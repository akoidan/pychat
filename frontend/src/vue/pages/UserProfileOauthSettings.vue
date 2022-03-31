<template>
  <div class="oauth-div">
    <app-submit @click.native="disconnectFacebook" v-if="facebookConnected" class="red-btn" value="Disconnect Facebook account"/>
    <facebook-auth v-else @token="facebookAuth" button-name="Connect Facebook account"/>

    <app-submit @click.native="disconnectGoogle" v-if="googleConnected" class="red-btn" value="Disconnect Google account"/>
    <google-auth v-else @token="googleAuth" button-name="Connect Google account"/>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue
} from 'vue-property-decorator';
import { OauthStatus } from '@/ts/types/dto';
import AppSubmit from '@/vue/ui/AppSubmit';
import FacebookAuth from '@/vue/singup/FacebookAuth';
import GoogleAuth from '@/vue/singup/GoogleAuth';

@Component({
  name: 'UserProfileOauthSettings' ,
  components: {GoogleAuth, FacebookAuth, AppSubmit}
})
export default class UserProfileOauthSettings extends Vue {

  private googleConnected: boolean = false;
  private facebookConnected: boolean = false;


  async created() {
    let response: OauthStatus = await this.$api.getOauthStatus();
    this.googleConnected = response.google;
    this.facebookConnected = response.facebook;
  }

  async disconnectGoogle() {
    await this.$api.setGoogleOauth('');
    this.googleConnected = false;
    this.$store.growlSuccess("Google account has been disconnected")
  }

  async disconnectFacebook() {
    await this.$api.setFacebookOauth('');
    this.facebookConnected = false;
    this.$store.growlSuccess("Facebook account has been disconnected")
  }

  async googleAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    try {
      await this.$api.setGoogleOauth(token);
      this.googleConnected = true;
      this.$store.growlSuccess("Google ouath has been configured successfully")
    } catch (e) {
      reject(e);

      return;
    }
    resolve();
  }

  async facebookAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    try {
      await this.$api.setFacebookOauth(token);
      this.facebookConnected = true;
      this.$store.growlSuccess("Facebook ouath has been configured successfully")
    } catch (e) {
      reject(e);

      return;
    }
    resolve();
  }
}
</script>

<style lang="sass" scoped>
  .oauth-div
    margin: auto
    max-width: 500px
    text-align: center
    > *
      display: inline-block
      margin: 10px
      width: 220px !important
</style>
