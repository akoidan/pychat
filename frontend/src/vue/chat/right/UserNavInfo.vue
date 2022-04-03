<template>
  <div class="user-row">
    <user-image-icon :user="user" />
    <div class="user-info">
      <span class="user-name">{{ user.user }}</span>
      <span class="user-online" v-if="isOnline">online</span>
      <span class="user-offline" v-else>offline</span>
    </div>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Watch,
    Ref
  } from 'vue-property-decorator';
  import {State} from '@/ts/instances/storeInstance';
  import UserImageIcon from '@/vue/chat/chatbox/UserImageIcon.vue';
  import {UserModel} from '@/ts/types/model';
  @Component({
    name: 'UserNavInfo' ,
    components: {UserImageIcon}
  })
  export default class UserNavInfo extends Vue {

    @Prop()
    public readonly user!: UserModel;

    @State
    public readonly online!: number[];

    get isOnline(): boolean {
      if (this.user) {
        return this.online.indexOf(this.user.id) >= 0;
      }
      return false
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
