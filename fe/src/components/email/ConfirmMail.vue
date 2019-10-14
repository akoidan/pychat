<template>
    <div>
        <div class="message">
            <div class="green">{{ message }}</div>
            <div class="red">{{ errorMessage}}</div>
            <br/>
            <router-link to="/" v-if="!loading">Go to main page</router-link>
        </div>
        <div class="spinner" v-if="loading" />
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {State} from '@/utils/storeHolder';
  import {ApplyGrowlErr} from '@/utils/utils';
  @Component
  export default class ConfirmMail extends Vue {

    message: string|null = null;
    errorMessage: string|null = null;
    loading!: boolean;

    @ApplyGrowlErr({runningProp: 'loading', vueProperty: 'errorMessage', message: 'Confirming email error '})
    async created() {
      await this.$api.confirmEmail(this.$route.query['token'] as string);
      this.message = 'Email has been confirmed';
    }
  }
</script>
<style lang="sass" scoped>

    @import "~@/assets/sass/partials/mixins"

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

