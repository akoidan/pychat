<template>
  <div class="oauth-div">
    <app-submit
      v-if="facebookConnected"
      class="red-btn"
      value="Disconnect Facebook account"
      @click.native="disconnectFacebook"
    />
    <facebook-auth v-else button-name="Connect Facebook account" @token="facebookAuth"/>

    <app-submit
      v-if="googleConnected"
      class="red-btn"
      value="Disconnect Google account"
      @click.native="disconnectGoogle"
    />
    <google-auth v-else button-name="Connect Google account" @token="googleAuth"/>
  </div>
</template>
<script lang="ts">
import {Component, Vue,} from "vue-property-decorator";
import type {OauthStatus} from "@/ts/types/dto";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import FacebookAuth from "@/vue/auth/FacebookAuth.vue";
import GoogleAuth from "@/vue/auth/GoogleAuth.vue";

@Component({
  name: "UserProfileOauthSettings",
  components: {
    GoogleAuth,
    FacebookAuth,
    AppSubmit,
  },
})
export default class UserProfileOauthSettings extends Vue {
  public googleConnected: boolean = false;

  public facebookConnected: boolean = false;


  async created() {
    const response: OauthStatus = await this.$api.restApi.getOauthStatus();
    this.googleConnected = response.google;
    this.facebookConnected = response.facebook;
  }

  async disconnectGoogle() {
    await this.$api.restApi.setGoogleOauth("");
    this.googleConnected = false;
    this.$store.growlSuccess("Google account has been disconnected");
  }

  async disconnectFacebook() {
    await this.$api.restApi.setFacebookOauth("");
    this.facebookConnected = false;
    this.$store.growlSuccess("Facebook account has been disconnected");
  }

  async googleAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    try {
      await this.$api.restApi.setGoogleOauth(token);
      this.googleConnected = true;
      this.$store.growlSuccess("Google ouath has been configured successfully");
    } catch (e) {
      reject(e);

      return;
    }
    resolve();
  }

  async facebookAuth({resolve, reject, token}: {token: string; resolve: Function; reject: Function}) {
    try {
      await this.$api.restApi.setFacebookOauth(token);
      this.facebookConnected = true;
      this.$store.growlSuccess("Facebook ouath has been configured successfully");
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
