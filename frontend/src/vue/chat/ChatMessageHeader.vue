<template>
  <span class="message-header">
    <span
      class="timeMess"
      @click="quote"
    >({{ getTime }})</span>
    <span>{{ user.user }}</span>:
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


@Component
export default class ChatMessageHeader extends Vue {

  @Prop() public userId!: number;
  @Prop() public time!: number;

  @State
  public readonly allUsersDict!: UserDictModel;

  get user() {
    return this.allUsersDict[this.userId];
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
