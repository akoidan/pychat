<template>
  <div>
    <div class="message">
      <div class="green">
        {{ message }}
      </div>
      <div class="red">
        {{ errorMessage }}
      </div>
      <br/>
      <router-link
        v-if="!loading"
        to="/"
      >
        Go to main page
      </router-link>
    </div>
    <div
      v-if="loading"
      class="spinner"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";

@Component({name: "ConfirmMail"})
export default class ConfirmMail extends Vue {
  public message: string | null = null;

  public errorMessage: string | null = null;

  public loading!: boolean;

  @ApplyGrowlErr({
    runningProp: "loading",
    vueProperty: "errorMessage",
    message: "Confirming email error ",
  })
  public async created() {
    await this.$api.confirmEmail(this.$route.query.token as string);
    this.message = "Email has been confirmed";
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"

.green
  color: green

.red
  color: red

.spinner
  @include lds-30-spinner-vertical('Verifying email...')

.message
  text-align: center
  font-size: 30px
  font-family: monospace
  display: table
  width: 100%
  vertical-align: middle
  margin-top: 15%
</style>

