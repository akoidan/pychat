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
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import AppSubmit from "@/components/ui/AppSubmit";
  import {FACEBOOK_APP_ID, GOOGLE_OAUTH_2_CLIENT_ID} from "@/utils/consts";
  import {ApplyGrowlErr, initFaceBook, initGoogle, login} from "@/utils/utils";

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
    googleToken: string|null = null;
    oauth_token: string = GOOGLE_OAUTH_2_CLIENT_ID;
    fb_app_id: string = FACEBOOK_APP_ID;


    get googleRunning() {
      return this.grunning || !this.googleApiLoaded;
    }

    get facebookRunning() {
      return this.frunning || !this.facebookApiLoaded;
    }

    @ApplyGrowlErr({ message: 'Unable to load google'})
    async loadGoogle(): Promise<void> {
      await initGoogle();
      this.googleApiLoaded = true;
    }

    @ApplyGrowlErr({ message: 'Unable to load facebook'})
    async loadFaceBook(): Promise<void> {
      await initFaceBook();
      this.facebookApiLoaded = true;
    }

    async created() {
      await Promise.all(<Promise<void>[]>[this.loadGoogle(), this.loadFaceBook()]);
    }

    async onGoogleSignIn(auth2: unknown) {
      // @ts-ignore: next-line
      let googleUser = auth2.currentUser.get();
      let profile = googleUser.getBasicProfile();
      this.logger.log("Signed as {} with id {} and email {}  ",
          profile.getName(), profile.getId(), profile.getEmail())();
      this.googleToken = googleUser.getAuthResponse().id_token;
      let s: string = await this.$api.googleAuth(this.googleToken!);
      login(s);
    }

    @ApplyGrowlErr({ message: 'Unable to login in with google', runningProp: 'grunning'})
    async logWithGoogle() {

      let auth2 = gapi.auth2.getAuthInstance();
      if (auth2.isSignedIn.get()) {
        await this.onGoogleSignIn(auth2);
      } else {
        await auth2.signIn();
      }
      await new Promise((resolve, reject) => {
        auth2.isSignedIn.listen(async (isSignedIn: boolean) => {
          if (isSignedIn) {
            resolve()
          } else {
            reject()
          }
        });
      });
      this.onGoogleSignIn(auth2);
    }

    @ApplyGrowlErr({ message: 'Unable to login in with facebook', runningProp: 'frunning'})
    async fbStatusChangeIfReAuth(response: {status: string}) {
      this.logger.debug("fbStatusChangeIfReAuth {}", response)();
      if (response.status === "connected") {
        // Logged into your app and Facebook.
        this.store.growlInfo("Successfully logged in into facebook, proceeding...");
        // TODO
        // @ts-ignore: next-line
        let s = await this.$api.facebookAuth(response.authResponse.accessToken);
        login(s);
        return false;
      } else if (response.status === "not_authorized") {
        this.frunning = false;
        this.store.growlInfo("Allow facebook application to use your data");
        return false;
      } else {
        return true;
      }
    }


    async facebookLogin() {
      this.frunning = true;

      let response: {status: string} = await new Promise(resolve => {
        FB.getLoginStatus((response: {status: string}) => resolve(response));
      });

      this.logger.log("fbStatusChange {}", response)();
      if (await this.fbStatusChangeIfReAuth(response)) {
        this.logger.log("Fblogin")();
        let response:{status: string} = await new Promise((resolve, reject) => {
          FB.login((r: {status: string}) => resolve(r), {
            auth_type: "reauthenticate",
            scope: "email"
          });
        });
        await this.fbStatusChangeIfReAuth(response);
      }
    }
  }
</script>

<style lang="sass" scoped>

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
                bottom: 0
                // expand to height
                right: 0
                // expand to width
                position: absolute
        //urlencoded

        .g-icon
            &:before
                background: url('~@/assets/img/g-icon.svg') no-repeat
                top: -8px
                left: -5px

            &:active:before
                top: -6px
                left: -3px

        .f-icon
            &:before
                background: url('~@/assets/img/f-icon.svg') no-repeat
                top: 5px
                left: 10px

            &:active:before
                top: 7px
                left: 12px
</style>
