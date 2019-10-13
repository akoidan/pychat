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
  import {State} from '@/utils/storeHolder';
  import {ApplyGrowlErr} from '@/utils/utils';
  @Component
  export default class ConfirmMail extends Vue {

    message: string|null = null;
    loading!: boolean;

    @ApplyGrowlErr('Confirming email error ', 'loading')
    async created() {
      this.message = await this.$api.confirmEmail(<string>this.$route.query['token']);
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

