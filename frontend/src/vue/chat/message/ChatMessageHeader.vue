<template>
  <span class="message-header">
    <user-image-icon :user="user"/>
  </span>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { UserDictModel } from '@/ts/types/model';
import { timeToString } from '@/ts/utils/htmlApi';

import UserImageIcon from '@/vue/chat/chatbox/UserImageIcon';
@Component({
  name: 'ChatMessageHeader' ,
  components: {UserImageIcon}
})
export default class ChatMessageHeader extends Vue {

  @Prop() public userId!: number;
  @Prop() public time!: number;

  @State
  public readonly allUsersDict!: UserDictModel;

  get user() {
    return this.allUsersDict[this.userId];
  }
}
</script>

<style lang="sass" scoped>

  .message-header
    display: flex

  img.user-name-sex
    margin: -8px 5px -8px 0
  .time-mess
    position: absolute
    right: 0
    font-size: 16px
    margin-right: 5px
    @media screen and (max-width: 400px)
      display: none !important
    &:hover
      cursor: pointer
      color: #979797

  .color-white
    .time-mess
      color: #85d379
      font-weight: normal
</style>
