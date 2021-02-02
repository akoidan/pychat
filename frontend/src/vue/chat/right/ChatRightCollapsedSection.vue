<template>
  <div>
    <span class="header">
      <div class="header-start">
        <span
          :class="directClass"
          @click="invertValue"
        />
      <slot name="name"/>
      </div>
    </span>
    <ul v-show="!value">
      <slot />
    </ul>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Emit
  } from 'vue-property-decorator';

  @Component({name: 'ChatRightCollapsedSection'})
 export default class ChatRightCollapsedSection extends Vue {
    @Prop()
    public readonly value!: boolean ;

    @Prop()
    public readonly name! : string;

    @Emit()
    public invertValue() {
      this.$emit('input', !this.value);
    }

    get directClass() {
      return this.value ? 'icon-angle-circled-up' : 'icon-angle-circled-down';
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/abstract_classes"
  @import "~@/assets/sass/partials/room_users_table.sass"

  .header
    font-size: 13px
    font-weight: bold
    @extend %user-select-none
    text-transform: uppercase
    vertical-align: middle
    padding: 5px
    display: flex
    justify-content: space-between
    align-items: center

  .color-reg

    .header
      background-color: #171717
  .color-lor
    .header
      background-color: #221f1f
      color: #8f8f8f
  .color-white
    .header
      background-color: #414141
      color: white
  .icon-angle-circled-down, .icon-angle-circled-up
    @extend %header-left-icon
  .icon-plus-squared
    @extend %header-right-icon

  ul
    @extend %ul
    font-size: 24px
</style>
