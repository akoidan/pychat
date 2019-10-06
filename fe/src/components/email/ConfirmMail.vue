<template>
    <div>
        <div class="message">
            {{ message }}<br/>
            <router-link to="/">Go to main page</router-link>
        </div>
        <div class="spinner" v-if="loading" />
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";



  @Component
  export default class ConfirmMail extends Vue {

    loading: boolean = true;
    message: string = null;
    created() {
     this.$api.confirmEmail(this.$route.query['token'], (data, error) => {
        this.loading = false;
        this.message = data || error;
     });
    }
  }
</script>
<style lang="sass" scoped>

    @import "~@/assets/sass/partials/mixins"

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

