<template>
  <form method="post" @submit.prevent="submitResetPassword">
    <div class="restoreHeader">Restore password for
      <b>{{ restoreUser }}</b>
    </div>
    <input type="password" name="password" class="input" required placeholder="password"/>
    <input type="password" name="repeatpassword" class="input" required placeholder="repeat password"/>
    <app-submit class='submit-button' value='Submit Password' :running="running"/>
  </form>
</template>
<script lang="ts">

  import {Prop, Component} from "vue-property-decorator";
  import Vue from 'vue';
  import AppSubmit from '../ui/AppSubmit.vue';

  @Component({components: {AppSubmit}})
  export default class ApplyResetPassword extends Vue {
    @Prop() restoreUser: string;

    submitResetPassword() {
      alert('todo');
    }
  }
</script>
<style scoped lang="sass">

  @import "register"

  $restPassMargin: 20px

  .restoreHeader
    font-size: 25px
    text-align: center
    width: 100%
    margin-left: $restPassMargin
    margin-right: $restPassMargin
</style>