<template>
  <div class="user-row">
    <user-image-icon :user="user"/>
    <div class="user-info">
      <span class="user-name">{{ user.user }}</span>
      <span v-if="isOnline" class="user-online">online</span>
      <span v-else class="user-offline">offline</span>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";
import UserImageIcon from "@/vue/chat/chatbox/UserImageIcon.vue";
import {UserModel} from "@/ts/types/model";

@Component({
  name: "UserNavInfo",
  components: {UserImageIcon},
})
export default class UserNavInfo extends Vue {
  @Prop()
  public readonly user!: UserModel;

  @State
  public readonly online!: number[];

  public get isOnline(): boolean {
    if (this.user) {
      return this.online.includes(this.user.id);
    }
    return false;
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
.user-row
  width: auto
  display: flex
  padding-left: 8px
  align-items: center

  .user-info
    display: flex
    flex-direction: column
    margin-left: 10px

  .user-online, .user-offline
    font-size: 12px

  .user-online
    color: #7eb1e3

  .user-offline
    color: grey
</style>
