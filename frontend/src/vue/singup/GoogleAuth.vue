<template>
  <app-submit
    v-if="oauth_token"
    class="g-icon lor-btn"
    :value="buttonName"
    type="button"
    :running="googleRunning"
    title="Sign in using google account"
    @click.native="logWithGoogle"
  />
</template>
<script lang="ts">
import { ApplyGrowlErr } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import { GOOGLE_OAUTH_2_CLIENT_ID } from '@/ts/utils/consts';

declare const gapi: any;

let googleInited = false; // this is a global variable

@Component({
  name: 'GoogleAuth' ,
  components: {AppSubmit}
})
export default class GoogleAuth extends Vue {
  public grunning: boolean = false;

  @Prop()
  public readonly buttonName!: string;

  public googleApiLoaded: boolean = false;

  public googleToken: string|null = null;
  public oauth_token: string = GOOGLE_OAUTH_2_CLIENT_ID;

  get googleRunning() {
    return this.grunning || !this.googleApiLoaded;
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
      try {
        await gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID});
      } catch (e) {
        throw Error(e?.details)
      }
      this.$logger.log('gauth 2 is ready')();
      googleInited = true;
    }

    this.googleApiLoaded = true;
  }

  public async created() {
    await this.loadGoogle();
  }


  @ApplyGrowlErr({ message: 'Unable to login in with google', runningProp: 'grunning'})
  public async logWithGoogle() {

    const auth2 = gapi.auth2.getAuthInstance();
    this.$logger.log("Calling signin on google api object")();
    await auth2.signIn();
    this.$logger.log("Signin resolved. Checking if we're signed....")();
    // @ts-ignore: next-line
    const googleUser = auth2.currentUser.get();
    if (!googleUser) {
      throw Error("Not signed");
    }
    const profile = googleUser.getBasicProfile();
    this.$logger.log(
        'Signed as {} with id {} and email {}  ',
        profile.getName(),
        profile.getId(),
        profile.getEmail()
    )();
    this.googleToken = googleUser.getAuthResponse().id_token;
    await new Promise((resolve, reject) => {
      this.$emit('token', {resolve, reject, token: this.googleToken})
    });
  }

}
</script>

<style lang="sass" scoped>

  .g-icon
    margin-right: 5px
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
      background: url('~@/assets/img/g-icon.svg') no-repeat
      top: -8px
      left: -5px

    &:active:before
      top: -6px
      left: -3px

</style>
