<template>
  <form @submit.prevent='restorePassword' ref="form">
    <div>
      <input type='text' class="input" required placeholder='Username or email'  name='username_or_password'
             value=''/>
      <div class='slider'>Enter your username or email</div>
    </div>
    <div v-if='captcha_key' class='g-recaptcha' data-theme='dark' :data-sitekey='captcha_key'></div>
    <div>
      <app-submit class='submit-button' value='Recover password' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";
  import AppSubmit from "../ui/AppSubmit.vue"
  import {Action, Mutation} from "vuex-class";

  @Component({components: {AppSubmit}})
  export default class ResetPassword extends Vue {

    $refs: {
      form: HTMLFormElement
    };

    @Mutation setRegHeader;

    @Prop() captcha_key: String;
    @Action growlError;
    running: boolean = false;


    created() {
      this.setRegHeader('Restore password');
    }

    restorePassword(event) {
      this.running = true;
      this.api.sendRestorePassword(this.$refs.form, error => {
        this.running = false;
        if (error) {
          this.growlError(error);
        }
      })
    }


  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"
  @import "partials/abstract_classes"

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