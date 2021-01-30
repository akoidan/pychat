<template>
  <div>
    <user-icon-or-sex :user="user"/>
    <span>{{ user.user }}</span>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue
  } from 'vue-property-decorator';
  import {UserModel} from '@/ts/types/model';
  import {resolveMediaUrl} from '@/ts/utils/htmlApi';
  import UserIconOrSex from '@/vue/chat/UserIconOrSex.vue';
  @Component({
    components: {UserIconOrSex}
  })
  export default class UserNameSex extends Vue {

    @Prop()
    public readonly user!: UserModel;

  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>



</style>
