<template>
  <user-row :user="user">
    <img
      v-if="consts.FLAGS && user.location.countryCode"
      :src="flag"
      :title="title"
    />
  </user-row>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import UserRow from "@/vue/chat/right/UserRow.vue";
import {UserModel} from "@/ts/types/model";
import {FLAGS} from "@/ts/utils/consts";
import {getFlagPath} from "@/ts/utils/htmlApi";

@Component({
  name: "UserFlagRow",
  components: {UserRow},
})
export default class UserFlagRow extends Vue {
  @Prop() public user!: UserModel;

  public get consts(): {FLAGS: boolean} {
    return {
      FLAGS,
    };
  }

  public get title() {
    if (this.user?.location.countryCode) {
      return "";
    }
    return this.user.location.region === this.user.location.city
      ? `${this.user.location.country} ${this.user.location.city}`
      : `${this.user.location.country} ${this.user.location.region} ${this.user.location.city}`;
  }

  public get flag() {
    if (this.user.location?.countryCode) {
      return getFlagPath(this.user.location.countryCode.toLowerCase());
    }
    return undefined;
  }

  public get id() {
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
