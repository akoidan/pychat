<template>
  <div>
    <app-submit
      v-if="oauth_token"
      class="g-icon lor-btn"
      value="Via Google"
      type="button"
      :running="googleRunning"
      title="Sign in using google account"
      @click.native="logWithGoogle"
    />

    <app-submit
      v-if="fb_app_id"
      class="f-icon lor-btn"
      value="Via Facebook"
      type="button"
      :running="facebookRunning"
      title="Sign in using facebook account"
      @click.native="facebookLogin"
    />
  </div>
</template>
<script lang="ts">
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';
import {Component, Prop, Vue} from 'vue-property-decorator';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import {FACEBOOK_APP_ID, GOOGLE_OAUTH_2_CLIENT_ID} from '@/ts/utils/consts';
import {sub} from '@/ts/instances/subInstance'
import { LoginMessage } from '@/ts/types/messages/innerMessages';

declare const gapi: any;
declare const FB: any;

let fbInited = false; // this is a global variable
let googleInited = false; // this is a global variable

@Component({
  components: {AppSubmit}
})
export default class SocialAuth extends Vue {
  public grunning: boolean = false;
  public frunning: boolean = false;
  public googleApiLoaded: boolean = false;
  public facebookApiLoaded: boolean = false;
  public googleToken: string|null = null;
  public oauth_token: string = GOOGLE_OAUTH_2_CLIENT_ID;
  public fb_app_id: string = FACEBOOK_APP_ID;
  public email: string|null = null;

  get googleRunning() {
    return this.grunning || !this.googleApiLoaded;
  }

  get facebookRunning() {
    return this.frunning || !this.facebookApiLoaded;
  }

  @ApplyGrowlErr({ message: 'Unable to load google'})
  public async loadGoogle(): Promise<void> {

    if (!googleInited && GOOGLE_OAUTH_2_CLIENT_ID) {
      this.$logger.log('Initializing google sdk')();
      await this.$api.loadGoogle();
      if (typeof gapi.load !== 'function') { // TODO
        throw Error(`Gapi doesnt have load function ${JSON.stringify(Object.keys(gapi))}`);
      }
      await new Promise(r => gapi.load('client:auth2', r));
      this.$logger.log('gapi 2 is ready')();
      await gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID});
      this.$logger.log('gauth 2 is ready')();
      googleInited = true;
    }

    this.googleApiLoaded = true;
  }

  @ApplyGrowlErr({ message: 'Unable to load facebook'})
  public async loadFaceBook(): Promise<void> {
    if (!fbInited && FACEBOOK_APP_ID) {
      await this.$api.loadFacebook();
      this.$logger.log('Initing facebook sdk...')();
      FB.init({
        appId: FACEBOOK_APP_ID,
        xfbml: true,
        version: 'v2.7'
      });
      fbInited = true;
    }

    this.facebookApiLoaded = true;
  }

  public async created() {
    await Promise.all([this.loadGoogle(), this.loadFaceBook()]);
  }

  public async onGoogleSignIn(auth2: unknown) {
    // @ts-ignore: next-line
    const googleUser = auth2.currentUser.get();
    const profile = googleUser.getBasicProfile();
    this.$logger.log('Signed as {} with id {} and email {}  ',
                    profile.getName(), profile.getId(), profile.getEmail())();
    this.googleToken = googleUser.getAuthResponse().id_token;
    const session: string = await this.$api.googleAuth(this.googleToken!);
    let message: LoginMessage = {action: 'login', handler: 'router', session};
    sub.notify(message);
  }

  @ApplyGrowlErr({ message: 'Unable to login in with google', runningProp: 'grunning'})
  public async logWithGoogle() {

    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
      await this.onGoogleSignIn(auth2);
    } else {
      await auth2.signIn();
    }
    await new Promise((resolve, reject) => {
      auth2.isSignedIn.listen(async (isSignedIn: boolean) => {
        if (isSignedIn) {
          resolve();
        } else {
          reject();
        }
      });
    });
    this.onGoogleSignIn(auth2);
  }

  @ApplyGrowlErr({ message: 'Unable to login in with facebook', runningProp: 'frunning'})
  public async fbStatusChangeIfReAuth(response: {status: string}) {
    this.$logger.debug('fbStatusChangeIfReAuth {}', response)();
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      this.$store.growlInfo('Successfully logged in into facebook, proceeding...');
      // TODO
      // @ts-ignore: next-line
      const s = await this.$api.facebookAuth(response.authResponse.accessToken);
      let message: LoginMessage = {action: 'login', handler: 'router', session: s};
      sub.notify(message)

      return false;
    } else if (response.status === 'not_authorized') {
      this.frunning = false;
      this.$store.growlInfo('Allow facebook application to use your data');

      return false;
    } else {
      return true;
    }
  }

  public async facebookLogin() {
    this.frunning = true;

    const response: {status: string} = await new Promise(resolve => {
      FB.getLoginStatus(resolve);
    });

    this.$logger.log('fbStatusChange {}', response)();
    if (await this.fbStatusChangeIfReAuth(response)) {
      this.$logger.log('Fblogin')();
      const response: {status: string} = await new Promise((resolve, reject) => {
        FB.login(resolve, {
          auth_type: 'reauthenticate',
          scope: 'email'
        });
      });
      let emailResponse = await new Promise((resolve, reject) => {
        FB.api('/me?scope=email', resolve, reject)
      });
      // TODO
      debugger
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
