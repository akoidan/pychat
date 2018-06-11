<template>
  <form v-on:submit.prevent='restorePassword' ref="form">
    <div>
      <input type='text' class="input" required placeholder='Username or email'  name='username_or_password'
             value=''/>
      <div class='slider'>Enter your username or email</div>
    </div>
    <div v-if='captcha_key' class='g-recaptcha' data-theme='dark' :data-sitekey='captcha_key'></div>
    <div>
      <submit class='submit-button' value='Recover password' :running="running"/>
    </div>
  </form>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";
  import {xhr} from "../../utils/singletons";
  import {Mutation} from "vuex-class";
  import Submit from "../ui/Submit.vue"

  @Component({components: {Submit}})
  export default class ResetPassword extends Vue {

    $refs: {
      form: HTMLFormElement
    }
    @Mutation setRegHeader;

    @Prop() captcha_key: String;


    created() {
      this.setRegHeader('Restore password');
    }

    register() {
      xhr.doPost("/register", null, (res) => {
        alert("works");
      });
    }

    restorePassword(event) {

      xhr.doPost("/send_restore_password", null, (data) => {
        alert('asd');
      }, new FormData(this.$refs.form));
    }


  }
</script>
<style lang="sass" scoped>

  @import "../../assets/sass/partials/mixins"
  @import "../../assets/sass/partials/variables"
  @import "register"

  form
    width: 40%
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