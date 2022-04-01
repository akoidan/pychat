<template>
  <chat-message-wrapper class="message-system" :time="time">
    <template #header>
      <span class="message-header">
      <span>System</span>: </span>
    </template>
    <span class="message-text-style">{{ isUser }} <b>{{ user }}</b> {{ where }}</span>
  </chat-message-wrapper>
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
import ChatMessageWrapper from '@/vue/chat/message/ChatMessageWrapper.vue';
@Component({
  name: 'ChatUserActionMessage' ,
  components: {ChatMessageWrapper}
})
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
}
</script>

<style lang="sass" scoped>
  .color-white .message-system
    background-color: #f2fbff
</style>
