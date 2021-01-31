<template>
  <i
    :class="userSexClass"
  />
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Watch,
    Ref
  } from 'vue-property-decorator';
  import {SexModelDto} from '@/ts/types/dto';
  import {SexModelString} from '@/ts/types/model';

  @Component
  export default class UserSexIcon extends Vue {

    @Prop()
    private sex!: SexModelString;

    get userSexClass() {
      if (this.sex === 'Male') {
        return 'icon-man';
      } else if (this.sex === 'Female') {
        return 'icon-girl';
      } else if (this.sex === 'Secret') {
        return 'icon-user-secret';
      } else {
        throw Error(`Invalid sex ${this.sex}`);
      }
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>

  .color-lor
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #2e9154
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #c53432

  .color-reg
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #1f772c
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #b32c1c

  .color-white
    .online
      .icon-man, .icon-girl, .icon-user-secret
        color: #78f584
    .offline
      .icon-man, .icon-girl, .icon-user-secret
        color: #fa9d9b
</style>
