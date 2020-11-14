<template>
  <li
    v-show="userIsInActiveRoom"
    :class="onlineClass"
  >
    <user-name-sex :user="user" :online="isOnline"/>
    <img
      v-if="consts.FLAGS && user.location.countryCode"
      class="country"
      :src="getFlag(user)"
      :title="title"
    >
  </li>
</template>
<script lang="ts">
import { State } from '@/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import {
  RoomModel,
  UserModel
} from '@/types/model';
import { getFlagPath, } from '@/utils/htmlApi';
import { FLAGS } from '@/utils/consts';
import UserNameSex from '@/components/chat/UserNameSex.vue';

@Component({
  components: {UserNameSex}
})
export default class RoomUsersUser extends Vue {
  @Prop() public user!: UserModel;
  @State
  public readonly activeRoom!: RoomModel;
  @State
  public readonly online!: number[];

  public get consts(): object {
    return {
      FLAGS,
    }
  }

  get title() {
    return this.user.location.region === this.user.location.city ?
      `${this.user.location.country} ${this.user.location.city}` :
      `${this.user.location.country} ${this.user.location.region} ${this.user.location.city}`;
  }

  public getFlag(user: UserModel) {
    if (user.location.countryCode) {
      return getFlagPath(user.location.countryCode.toLowerCase());
    } else {
      return null;
    }
  }

  get id() {
    return this.user.id;
  }

  get userIsInActiveRoom() {
    const ar = this.activeRoom;

    return ar && ar.users.indexOf(this.user.id) >= 0;
  }

  get onlineClass () {
    return this.isOnline ? 'offline' : 'online';
  }

  private get isOnline() {
    return this.online.indexOf(this.user.id) < 0;
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/room_users_table.sass"

  li
    @extend %li
  div
    text-overflow: ellipsis
    word-break: break-all
    overflow: hidden
</style>
