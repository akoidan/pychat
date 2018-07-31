<template>
  <div>
    <app-submit
        v-if='oauth_token'
        class='g-icon lor-btn'
        value='Via Google'
        type="button"
        :running="googleRunning"
        title='Sign in using google account'
        @click.native='logWithGoogle'/>

    <app-submit
        v-if='fb_app_id'
        class='f-icon lor-btn'
        value='Via Facebook'
        type="button"
        :running="facebookRunning"
        title='Sign in using facebook account'
        @click.native='facebookLogin'>
    </app-submit>

  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from '../ui/AppSubmit';
  import {FACEBOOK_APP_ID, GOOGLE_OAUTH_2_CLIENT_ID} from "../../utils/consts";
  import {initFaceBook, initGoogle, login} from "../../utils/utils";

  declare const gapi: any;
  declare const FB: any;

  @Component({
    components: {AppSubmit}
  })
  export default class SocialAuth extends Vue {
    grunning: boolean = false;
    frunning: boolean = false;
    googleApiLoaded: boolean = false;
    facebookApiLoaded: boolean = false;
    googleToken: string = null;
    oauth_token: string = GOOGLE_OAUTH_2_CLIENT_ID;
    fb_app_id: string = FACEBOOK_APP_ID;
    @Action growlInfo;
    @Action growlError;

    get googleRunning() {
      return this.grunning || !this.googleApiLoaded;
    }

    get facebookRunning() {
      return this.frunning || !this.facebookApiLoaded;
    }

    created() {
      initGoogle(e => {
        this.googleApiLoaded = !e;
        if (e) {
          this.growlError("Unable to load google" + e);
        }
      });
      initFaceBook(e => {
        this.facebookApiLoaded = !e;
        if (e) {
          this.growlError("Unable to load fb" + e);
        }
      });
    }

    sendGoogleTokenToServer(token, redirectToNextPage) {
      this.growlInfo('Successfully logged into google successfully, proceeding...');
      this.$api.googleAuth(token, redirectToNextPage);
    }

    onGoogleSignIn(auth2) {
      let googleUser = auth2.currentUser.get();
      let profile = googleUser.getBasicProfile();
      this.logger.log("Signed as {} with id {} and email {}  ",
          profile.getName(), profile.getId(), profile.getEmail())();
      this.googleToken = googleUser.getAuthResponse().id_token;
      this.senGtoken();
    }

    senGtoken() {
      this.grunning = true;
      this.$api.googleAuth(this.googleToken, (s, e) => {
        this.grunning = false;
        login(s, e)
      });
    }

    logWithGoogle() {
      this.grunning = true;
      let auth2 = gapi.auth2.getAuthInstance();

      auth2.isSignedIn.listen((isSignedIn) => {
        if (isSignedIn) {
          this.onGoogleSignIn(auth2);
        } else {
          this.grunning = false;
          this.logger.warn("Skipping sending token because not signed in into google")();
        }
      });
      if (auth2.isSignedIn.get()) {
        this.onGoogleSignIn(auth2);
      } else {
        auth2.signIn().catch( e=> {
          this.grunning = false;
          this.logger.error("auth2.signIn().catch {}", e)();
          this.growlError("Initing error " + e);
        });
      }
    }


    fbStatusChangeIfReAuth(response) {
      this.logger.debug('fbStatusChangeIfReAuth {}', response)();
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
        this.growlInfo("Successfully logged in into facebook, proceeding...");
        this.$api.facebookAuth(response.authResponse.accessToken, (s, e) => {
          this.frunning = false;
          login(s, e);
        });
      } else if (response.status === "not_authorized") {
        this.frunning = false;
        this.growlInfo("Allow facebook application to use your data");
      } else {
        return true;
      }
    }


    facebookLogin() {
      this.frunning = true;

      FB.getLoginStatus(response => {
        this.logger.log("fbStatusChange {}", response)();
        if (this.fbStatusChangeIfReAuth(response)) {
          this.logger.log("Fblogin")();
          FB.login(this.fbStatusChangeIfReAuth, {auth_type: "reauthenticate",  scope: 'email'});
        } else {
          this.frunning = false;
        }
      });
    }
  }
</script>

<style lang="sass" scoped>

  $img-path: "../../assets/img"

  div
    display: flex
    padding: 5px 0 15px 0
    flex-direction: row

  .g-icon
    margin-right: 5px
  .f-icon
    margin-left: 5px
  .g-icon, .f-icon
    font: 12px Oswald
    position: relative
    flex-grow: 1

    margin-left: 0
    overflow: hidden

    &:before
      content: ''
      bottom: 0 // expand to height
      right: 0 // expand to width
      position: absolute
      //urlencoded

  .g-icon
    &:before
      background: url('#{$img-path}/g-icon.svg') no-repeat
      top: -8px
      left: -5px
    &:active:before
      top: -6px
      left: -3px
  .f-icon
    &:before
      background: url('#{$img-path}/f-icon.svg') no-repeat
      top: 5px
      left: 10px
    &:active:before
      top: 7px
      left: 12px
</style>