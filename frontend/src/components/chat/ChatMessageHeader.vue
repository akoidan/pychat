<template>
  <span class="message-header">
    <span
      class="timeMess"
      @click="quote"
    >({{ getTime }})</span>
    <span @contextmenu.prevent.stop="setActiveUser">{{ username }}</span>:
  </span>
</template>
<script lang="ts">
import { State } from '@/utils/storeHolder';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { UserDictModel } from '@/types/model';
import { timeToString } from "@/utils/htmlApi";


@Component
export default class ChatMessageHeader extends Vue {

  @Prop() public userId!: number;
  @Prop() public time!: number;

  @State
  public readonly allUsersDict!: UserDictModel;

  public setActiveUser() {
    this.$store.setActiveUserId(this.userId);
  }

  get username() {
    return this.allUsersDict[this.userId].user;
  }

  get getTime() {
    return timeToString(this.time);
  }

  public quote() {
    this.$emit('quote');
  }
}
</script>

<style lang="sass" scoped>
  .timeMess
    @media screen and (max-width: 400px)
      display: none !important
    &:hover
      cursor: pointer
      color: #979797

  .color-white
    .timeMess
      color: #85d379
      font-weight: normal
</style>
