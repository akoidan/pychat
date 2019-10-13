<template>
  <li :class="onlineClass" v-show="userIsInActiveRoom">
    <div><i :class="userSexClass"></i>{{ user.user }}</div>
    <img v-if="user.location.countryCode" class="country" :src='getFlag(user)' :title="title"/>
  </li>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {RoomModel, UserModel} from "@/types/model";
  import {
    getFlagPath,
    getUserSexClass
  } from "@/utils/htmlApi";

  @Component
  export default class RoomUsersUser extends Vue {
    @Prop() user!: UserModel;
    @State
    public readonly activeRoom!: RoomModel;
    @State
    public readonly online!: number[];

    get userSexClass () {
      return getUserSexClass(this.user);
    }

    get title() {
      return this.user.location.region === this.user.location.city ?
        `${this.user.location.country} ${this.user.location.city}` :
        `${this.user.location.country} ${this.user.location.region} ${this.user.location.city}`;
    }

    getFlag(user: UserModel) {
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
      let ar = this.activeRoom;
      return ar && ar.users.indexOf(this.user.id) >= 0;
    }

    get onlineClass () {
      return this.online.indexOf(this.user.id) < 0 ? 'offline' : 'online';
    }

  }
</script>

<style lang="sass" scoped>
  li
    display: flex
    justify-content: space-between
  div
    text-overflow: ellipsis
    word-break: break-all
    overflow: hidden
</style>
