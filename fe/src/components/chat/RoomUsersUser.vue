<template>
  <li :class="onlineClass" v-show="userIsInActiveRoom">
    <i :class="userSexClass"></i>{{ user.user }}
  </li>
</template>
<script lang="ts">
  import {Getter, State} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {RoomModel, UserModel} from "../../types/model";
  import {getUserSexClass} from "../../utils/htmlApi";

  @Component
  export default class RoomUsersUser extends Vue {
    @Prop() user: UserModel;
    @Getter activeRoom: RoomModel;
    @State online: number[];

    get userSexClass () {
      return getUserSexClass(this.user);
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
</style>