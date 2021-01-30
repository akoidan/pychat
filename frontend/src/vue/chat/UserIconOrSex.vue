<template>
  <img
    v-if="user.image"
    :src="userImg"
  >
  <i
    v-else
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
  import {UserModel} from '@/ts/types/model';
  import {resolveMediaUrl} from '@/ts/utils/htmlApi';

  @Component
  export default class UserIconOrSex extends Vue {
    @Prop()
    public readonly user!: UserModel;

    get userImg() {
      if (this.user.image) {
        return resolveMediaUrl(this.user.image)
      }
      return  null;
    }

    get userSexClass() {
      if (this.user.sex === 'Male') {
        return 'icon-man';
      } else if (this.user.sex === 'Female') {
        return 'icon-girl';
      } else if (this.user.sex === 'Secret') {
        return 'icon-user-secret';
      } else {
        throw Error(`Invalid sex ${this.user.sex}`);
      }
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  img
    max-height: 36px
    max-width: 50px

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
