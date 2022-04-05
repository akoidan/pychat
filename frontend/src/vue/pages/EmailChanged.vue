<template>
  <div>
    <div class="message">
      {{ message }}<br/>
      <router-link to="/">
        Go to main page
      </router-link>
    </div>
    <div v-if="loading" class="spinner"/>
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
  public loading!: boolean;

  public message: string | null = null;

  @ApplyGrowlErr({
    runningProp: "loading",
    vueProperty: "message",
    message: "Error changing mail"
  })
  public async created() {
    this.message = await this.$api.changeEmail(<string>this.$route.query.token);
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"

.spinner
  @include lds-30-spinner-vertical('Changing email...')

.message
  text-align: center
  font-size: 30px
  font-family: monospace
  display: table
  width: 100%
  vertical-align: middle
  margin-top: 15%
</style>re

