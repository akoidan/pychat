<template>
  <user-row :user="user">
    <img
      v-if="consts.FLAGS && user.location.countryCode"
      :src="flag"
      :title="title"
    >
  </user-row>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Watch,
    Ref
  } from 'vue-property-decorator';
  import UserRow from '@/vue/chat/right/UserRow.vue';
  import {
    RoomModel,
    UserModel
  } from '@/ts/types/model';
  import {State} from '@/ts/instances/storeInstance';
  import {FLAGS} from '@/ts/utils/consts';
  import {getFlagPath} from '@/ts/utils/htmlApi';
  @Component({
    name: 'UserFlagRow' ,
    components: {UserRow}
  })
  export default class UserFlagRow extends Vue {
    @Prop() public user!: UserModel;

    public get consts(): object {
      return {
        FLAGS,
      }
    }

    get title() {
      if (this.user?.location.countryCode) {
        return "";
      }
      return this.user.location.region === this.user.location.city ?
          `${this.user.location.country} ${this.user.location.city}` :
          `${this.user.location.country} ${this.user.location.region} ${this.user.location.city}`;
    }

    get flag() {
      if (this.user.location?.countryCode) {
        return getFlagPath(this.user.location.countryCode.toLowerCase());
      } else {
        return null;
      }
    }

    get id() {
      return this.user.id;
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
</style>
