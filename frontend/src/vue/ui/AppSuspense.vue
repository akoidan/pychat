<template>
  <div>
    <div v-if="error">
      {{ error }}
    </div>
    <div v-else-if="!currentRequest">
      <slot />
    </div>
    <div v-else>
      <div class="spinner" />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch, Ref} from "vue-property-decorator";

@Component({})
export default class AppSuspense extends Vue {

  private currentRequest: XMLHttpRequest|null = null;
  private error: string = ''

  async checkEmail(doRequest: (r: XMLHttpRequest) => any) {
    this.error = '';
    if (this.currentRequest) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
    try {
      // @ts-ignore
      let result = await doRequest((r: XMLHttpRequest) => this.currentRequest = r);
      console.warn(result);
      this.currentRequest = null;
      return result;
    } catch (errors) {
      this.error = errors.message;
      this.currentRequest = null;
    }
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "@/assets/sass/partials/mixins"

  .spinner
    display: inline-block
    margin: -4px 10px -4px 10px
    @include spinner(3px, black)
</style>
