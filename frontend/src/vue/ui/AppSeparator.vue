<template>
  <fieldset>
    <legend align="center">
      {{ day }}
    </legend>
  </fieldset>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";

@Component({name: "AppSeparator"})
export default class AppSeparator extends Vue {
  @Prop()
  public readonly day!: string;
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
@import "@/assets/sass/partials/variables"
fieldset
  border-top: 1px solid #e8e8e8
  border-bottom: none
  border-left: none
  border-right: none
  display: block
  text-align: center
  padding: 0
  //margin: $space-between-messages 10px $space-between-messages 3px
  margin: 0 10px 0 3px

  legend
    padding: 0 10px
    font-weight: bold

.color-lor fieldset legend
  color: #9DD3DD

.color-reg fieldset legend
  color: #9DD3DD
</style>
