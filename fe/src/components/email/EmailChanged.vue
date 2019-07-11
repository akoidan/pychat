<template>
    <div>
        <div class="message">
            {{ message }}<br/>
            <router-link to="/">Go to main page</router-link>
        </div>
        <app-spinner v-if="loading" text="Changing email..."/>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {Mutation, State} from "vuex-class";
  import AppSpinner from '../ui/AppSpinner';


  @Component({
    components: { AppSpinner}
  })
  export default class ConfirmMail extends Vue {

    loading: boolean = true;
    message: string = null;
    created() {
     this.$api.changeEmail(this.$route.query['token'], (data, error) => {
        this.loading = false;
        this.message = data || error;
     });
    }
  }
</script>
<style lang="sass" scoped>

    .message
        text-align: center
        font-size: 30px
        font-family: monospace
        display: table
        width: 100%
        vertical-align: middle
        margin-top: 15%
</style>re

