<template>
  <div>
    <div v-if="error">
      {{ error }}
    </div>
    <div v-else-if="!currentRequest">
      <slot/>
    </div>
    <div v-else>
      <div class="spinner"/>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";

@Component({
  name: "AppSuspense",
})
export default class AppSuspense extends Vue {
  public currentRequest: XMLHttpRequest | null = null;

  public error: string = "";

  async checkEmail(doRequest: (r: XMLHttpRequest) => any) {
    this.error = "";
    if (this.currentRequest) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
    try {
      // @ts-expect-error
      const result = await doRequest((r: XMLHttpRequest) => this.currentRequest = r);
      console.warn(result);
      this.currentRequest = null;
      return result;
    } catch (errors) {
      this.error = (errors as any).message;
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
