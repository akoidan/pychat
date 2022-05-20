<template>
  <nav>
    <slot/>
  </nav>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({name: "AppNavWrapper"})
export default class AppNavWrapper extends Vue {

}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>


@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/abstract_classes"


nav
  max-height: 32px
  @extend %nav
</style>
