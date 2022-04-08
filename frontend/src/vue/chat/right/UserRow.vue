<template>
  <div
    :class="onlineClass"
  >
    <div class="user-name-sex">
      <user-image-icon :user="user"/>
      <span>{{ user.user }}</span>
    </div>
    <slot/>
  </div>
</template>
<script lang="ts">
import {State} from "@/ts/instances/storeInstance";
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {
  RoomModel,
  UserModel,
} from "@/ts/types/model";
import UserImageIcon from "@/vue/chat/chatbox/UserImageIcon.vue";


@Component({
  name: "UserRow",
  components: {UserImageIcon},
})
export default class UserRow extends Vue {
  @Prop() public user!: UserModel;

  @State
  public readonly activeRoom!: RoomModel;

  @State
  public readonly online!: number[];


  public get id() {
    return this.user.id;
  }

  public get onlineClass() {
    return this.isOnline ? "offline" : "online";
  }

  private get isOnline() {
    return !this.online.includes(this.user.id);
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/sass/partials/room_users_table"
.user-icon
  width: 60px
  display: flex
  justify-content: space-around

.online, .offline
  display: flex
  justify-content: space-between
  width: 100%

.user-name-sex
  display: flex

  :deep(i)
    position: relative
    top: 3px
    margin-right: 3px

span
  margin-left: 5px

div
  text-overflow: ellipsis
  word-break: break-all
  overflow: hidden
</style>
