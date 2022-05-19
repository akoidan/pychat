<template>
  <form
    @submit.prevent="restorePassword"
  >
    <div>
      <input
        class="input"
        name="username_or_password"
        placeholder="Username or email"
        required
        type="text"
        v-model="userNameOrEmail"
      />
      <div class="slider">
        Enter your username or email
      </div>
    </div>
     <captcha-component v-model:loading="running" v-model:token="captcha"/>
    <div>
      <app-submit
        :running="running"
        class="submit-button"
        value="Recover password"
      />
    </div>
  </form>
</template>

<script lang='ts'>
import {
  Component,
  Ref,
  Vue,
} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import CaptchaComponent from "@/vue/auth/CaptchaComponent.vue";

@Component({
  name: "ResetPassword",
  components: {
    CaptchaComponent,
    AppSubmit,
  },
})
export default class ResetPassword extends Vue {

  @Ref()
  public repactha!: HTMLElement;

  public running: boolean = false;
  public captcha: string = '';
  public userNameOrEmail: string = '';

  public created() {
    this.$store.setRegHeader("Restore password");
  }

  @ApplyGrowlErr({
    runningProp: "running",
    message: "Can't reset password",
  })
  public async restorePassword(event: Event) {
    await this.$api.verifyApi.sendRestorePassword({
      captcha: this.captcha,
      email: this.userNameOrEmail.includes('@') ? this.userNameOrEmail : undefined,
      username: !this.userNameOrEmail.includes('@') ? this.userNameOrEmail: undefined,
    });
    this.$store.growlSuccess("A reset email has been sent to your email address, please follow the instruction in it");
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"

.slider
  @extend %slider

form
  margin-top: 10%
  flex-direction: column
  @include display-flex(!important)
  max-width: 400px
  min-width: 200px
  $height: 70px
  $padding: 20px

  > input
    padding: $padding
    margin: 20px
    display: block
    width: 100%
    height: 50px
    font-size: 20px

  [type=password]
    $dif: $padding * 2
    width: calc(100% - #{$dif})
    height: $height - ($padding + 1) * 2

  [type=submit]
    height: $height

</style>
