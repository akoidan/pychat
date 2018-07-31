<template>
  <app-spinner v-if="checkingToken" text="Checking token..."/>
  <h1 v-else-if="error" class="error">
    {{error}}
  </h1>
  <form v-else method="post" @submit.prevent="submitResetPassword">
    <div class="restoreHeader">Restore password for
      <b>{{ restoreUser }}</b>
    </div>
    <input type="password" v-model="password" class="input" required placeholder="password"/>
    <input type="password" v-model="repeatPassword" class="input" required placeholder="repeat password"/>
    <app-submit class='submit-button' value='Submit Password' :running="running"/>
  </form>
</template>
<script lang="ts">

  import {Prop, Component} from "vue-property-decorator";
  import Vue from 'vue';
  import {Action } from 'vuex-class';
  import AppSubmit from '../ui/AppSubmit.vue';
  import AppSpinner from '../ui/AppSpinner';

  @Component({components: {AppSpinner, AppSubmit}})
  export default class ApplyResetPassword extends Vue {

    @Action growlError;
    @Action growlSuccess;


    restoreUser: string = '';
    error: string = null;
    checkingToken: boolean = false;
    running: boolean = false;
    password: string = '';
    repeatPassword: string = '';


    created() {
      this.checkingToken = true;
      this.$api.verifyToken(this.$route.params["token"], (user: string, error: string) => {
        this.checkingToken = false;
        if (error) {
          this.error = error;
        } else if (user) {
          this.restoreUser = user;
        }
      })
    }
    submitResetPassword() {
      if (this.password != this.repeatPassword) {
        this.growlError("Passords don't match");
      } else {
        this.running = true;
        this.$api.acceptToken(this.$route.params["token"], this.password, cb => {
          this.running = false;
          if (cb) {
            this.growlError(cb);
          } else {
            this.growlSuccess("Password has been reset");
            this.$router.replace('/auth/login');
          }
        })
      }
    }
  }
</script>
<style scoped lang="sass">

  $restPassMargin: 20px

  .restoreHeader
    font-size: 25px
    text-align: center
    width: 100%
    margin-left: $restPassMargin
    margin-right: $restPassMargin

  .error
    color: red
</style>