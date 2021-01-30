<template>
  <span class="message-header">
    <span
      class="timeMess"
      @click="quote"
    >({{ getTime }})</span>
    <user-icon-or-sex :user="user" class="user-name-sex"/>
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
import UserNameSex from '@/vue/chat/UserNameSex.vue';
import UserIconOrSex from '@/vue/chat/UserIconOrSex.vue';
@Component({
  components: {UserIconOrSex, UserNameSex}
})
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

  .message-header
    display: flex

  img.user-name-sex
    margin: -8px 5px -8px 0
  .timeMess
    margin-right: 5px
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
