<template>
  <div
    v-if="checkingToken"
    class="spinner"
  />
  <h1
    v-else-if="error"
    class="error"
  >
    {{ error }}
  </h1>
  <form
    v-else
    method="post"
    @submit.prevent="submitResetPassword"
  >
    <div class="restoreHeader">
      Restore password for
      <b>{{ restoreUser }}</b>
    </div>
    <input
      v-model="password"
      class="input"
      placeholder="password"
      required
      type="password"
    />
    <input
      v-model="repeatPassword"
      class="input"
      placeholder="repeat password"
      required
      type="password"
    />
    <app-submit
      :running="running"
      class="submit-button"
      value="Submit Password"
    />
  </form>
</template>
<script lang="ts">

import {Component, Vue,} from "vue-property-decorator";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {LoginMessage} from '@/ts/types/messages/innerMessages';

@Component({
  name: "ApplyResetPassword",
  components: {AppSubmit},
})
export default class ApplyResetPassword extends Vue {
  restoreUser: string = "";

  error: string | null = null;

  checkingToken: boolean = false;

  running: boolean = false;

  password: string = "";

  repeatPassword: string = "";

  @ApplyGrowlErr({
    runningProp: "checkingToken",
    vueProperty: "error",
  })
  async created() {
    let data = await this.$api.verifyApi.verifyToken({token: (this.$route.query.token) as string});
    this.restoreUser = data.username;
  }

  @ApplyGrowlErr({
    runningProp: "running",
    vueProperty: "error",
    message: "Resetting pass err",
  })
  async submitResetPassword() {
    if (this.password !== this.repeatPassword) {
      this.$store.growlError("Passords don't match");
    } else {
      let response = await this.$api.verifyApi.acceptToken({
        token: this.$route.query.token as string,
        password: this.password
      });
      const {session} = response;
      const message: LoginMessage = {
        action: "login",
        handler: "router",
        session,
      };
      this.$messageBus.notify(message);
    }
  }
}
</script>
<style lang="sass" scoped>

$restPassMargin: 20px

@import "@/assets/sass/partials/mixins"

.spinner
  @include lds-30-spinner-vertical('Checking token...')

.restoreHeader
  font-size: 25px
  text-align: center
  width: 100%
  margin-left: $restPassMargin
  margin-right: $restPassMargin

.error
  color: red
</style>
