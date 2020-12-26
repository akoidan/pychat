<template>
  <p class="message-system">
    <span class="message-header">
      <span class="timeMess">({{ getTime }})</span>
      <span>System</span>: </span>
    <span class="message-text-style">{{ isUser }} <b>{{ user }}</b> {{ where }}</span>
  </p>
</template>
<script lang="ts">
import { State } from '@/ts/instances/storeInstance';
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { UserModel } from '@/ts/types/model';
import {timeToString} from '@/ts/utils/htmlApi';


@Component
export default class ChatUserActionMessage extends Vue {
  @Prop() public time!: number;
  @Prop() public userId!: number;
  @Prop() public action!: string;

  @State
  public readonly allUsersDict!: {[id: number]: UserModel} ;
  @State
  public readonly myId!: number;

  get where () {
    return `${this.isMe ? 'have' : 'has'} ${this.action}`;
  }

  get isUser() {
    return this.isMe ? '' : 'User';
  }

  get user () {
    return this.isMe ? 'You' : this.allUsersDict[this.userId].user;
  }

  get isMe() {
    return this.userId === this.myId;
  }

  get getTime() {
    return timeToString(this.time);
  }
}
</script>

<style lang="sass" scoped>
  .color-white .message-system
    background-color: #f2fbff
</style>
