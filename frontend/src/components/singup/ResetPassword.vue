<template>
  <form
    ref="form"
    @submit.prevent="restorePassword"
  >
    <div>
      <input
        type="text"
        class="input"
        required
        placeholder="Username or email"
        name="username_or_password"
        value=""
      >
      <div class="slider">
        Enter your username or email
      </div>
    </div>
    <captcha-component v-model="running" />
    <div>
      <app-submit
        class="submit-button"
        value="Recover password"
        :running="running"
      />
    </div>
  </form>
</template>

<script lang='ts'>
import {Vue, Component, Prop, Ref} from 'vue-property-decorator';
import AppSubmit from '@/components/ui/AppSubmit';
import {State} from '@/instances/storeInstance';
import CaptchaComponent from '@/components/singup/CaptchaComponent';
import {ApplyGrowlErr} from '@/instances/storeInstance';

@Component({components: {CaptchaComponent, AppSubmit}})
export default class ResetPassword extends Vue {

  @Ref()
  public form!: HTMLFormElement;

  @Ref()
  public repactha!: HTMLElement;

  public running: boolean = false;

  public created() {
    this.$store.setRegHeader('Restore password');
  }

  @ApplyGrowlErr({runningProp: 'running', message: `Can't reset password`})
  public async restorePassword(event: Event) {
    await this.$api.sendRestorePassword(this.form);
    this.$store.growlSuccess('A reset email has been sent to your email address, please follow the instruction in it');
  }

}
</script>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

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
      margin:  20px
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
