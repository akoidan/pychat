<template>
  <img
    v-if="user.image"
    :src="userImg"
  >
  <user-sex-icon v-else :sex="user.sex" />
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
  import UserSexIcon from '@/vue/chat/chatbox/UserSexIcon.vue';
  @Component({
    components: {UserSexIcon}
  })
  export default class UserIconOrSex extends Vue {
    @Prop()
    public readonly user!: UserModel;

    get userImg() {
      if (this.user.image) {
        return resolveMediaUrl(this.user.image)
      }
      return  null;
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
    max-width: 36px
    border-radius: 50%

</style>
