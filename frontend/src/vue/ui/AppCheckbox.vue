<template>
  <div>
    <input
      :id="uniqueId"
      ref="checkbox"
      :checked="modelValue"
      type="checkbox"
      @change="onchange"
    />
    <label :for="uniqueId"/>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Ref,
  Vue,
} from "vue-property-decorator";


let uniqueId = 1;

// This one is global for all checkboxes, so don't move it into this
function getUniqueId() {
  return uniqueId++;
}

@Component({name: "AppCheckbox"})
export default class AppCheckbox extends Vue {
  @Prop()
  public readonly modelValue!: boolean;

  public uniqueId!: string;

  @Ref()
  private checkbox!: HTMLInputElement;

  public onchange(e: Event) {
    this.input(e);
  }

  @Emit('update:modelValue')
  public input(e: Event) {
    debugger
    return this.checkbox.checked;
  }

  public created() {
    this.uniqueId = `checkboxN${getUniqueId()}`;
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"

.color-reg input[type=checkbox], .color-lor input[type=checkbox]
  display: none

  + label
    display: block
    @include linear-double-gradient(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1), #{'left, #2f4e2d 50%'}, #812626 50%)
    background-size: 100% 100%, 200% 100%
    background-position: 0 0, 15px 0
    border-radius: 25px
    box-shadow: inset 0 1px 4px hsla(0, 0%, 0%, .5), inset 0 0 10px hsla(0, 0%, 0%, .5), 0 0 0 1px hsla(0, 0%, 0%, .1), 0 -1px 2px 2px hsla(0, 0%, 0%, .25), 0 2px 2px 2px hsla(0, 0%, 100%, .15)
    cursor: pointer
    height: 25px
    width: 75px
    position: relative
    @include transition(.25s)

    &:before
      display: block
      background-color: #eee
      @include linear-gradient(#4B4E45, #33352F)
      border-radius: 25px
      box-shadow: inset 0 1px 1px 1px hsla(0, 0%, 100%, 0.1), inset 0 -1px 1px 1px hsla(0, 0%, 0%, .25), 0 1px 3px 1px hsla(0, 0%, 0%, .5), 0 0 2px hsla(0, 0%, 0%, .25)
      content: ''
      height: 25px
      width: 50px
      left: 0
      top: 0

  &:checked + label
    background-position: 0 0, 35px 0 !important
    padding-left: 25px
    padding-right: 0
    width: 50px

</style>
