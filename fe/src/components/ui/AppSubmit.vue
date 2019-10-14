<template>
  <button
    :disabled="running"
    :class="btnClass"
  >
    <div
      v-if="running"
      class="spinner"
    />
    <slot />{{ value }}
  </button>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";

  @Component
  export default class AppSubmit extends Vue {
    @Prop()
    public readonly value!: string;
    @Prop()
    public readonly running!: boolean;

    get btnClass(): string {
      return this.running ? 'sp-loading' : '';
    }
  }
</script>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"

  .spinner
    display: inline-block
    margin: -4px 10px -4px 10px
    @include spinner(3px, black)

</style>
