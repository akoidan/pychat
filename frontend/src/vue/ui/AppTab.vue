<template>
  <div class="links">
    <slot/>
  </div>
</template>
<script lang="ts">
import {Component, Vue,} from "vue-property-decorator";

@Component({name: "AppTab"})
export default class AppTab extends Vue {

}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"
.links
  display: flex
  margin-top: 10px
  padding: 8px
  justify-content: space-between

  :deep(a)
    padding: 0 10px
    color: $link-color

    &:hover
      cursor: pointer
      text-decoration: underline

    &.router-link-active
      color: $active-color
      text-decoration: underline

@media screen and (max-width: $collapse-width)
  .links
    flex-direction: column
    padding: 0

    a
      text-align: center
      padding: 4px

.color-white .links :deep(a)
  color: #c3fffd

  &.router-link-active
    color: #e8e156
</style>
