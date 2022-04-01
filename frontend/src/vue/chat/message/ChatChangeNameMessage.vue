<template>
  <chat-message-wrapper class="message-system" :time="time">
    <template #header>
      <span class="message-header">
      <span>System</span>: </span>
    </template>
    <span class="message-text-style">
      This room has been renamed from <b>{{ oldName }}</b> to <b>{{ newName }}</b>
    </span>
  </chat-message-wrapper>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { timeToString } from '@/ts/utils/htmlApi';
import ChatMessageWrapper from '@/vue/chat/message/ChatMessageWrapper.vue';
@Component({
  name: 'ChatChangeNameMessage' ,
  components: {ChatMessageWrapper}
})
export default class ChatChangeNameMessage extends Vue {
  @Prop() public time!: number;
  @Prop() public oldName!: string;
  @Prop() public newName!: string;
}
</script>

<style lang="sass" scoped>
  .color-white .message-system
    background-color: #f2fbff
</style>
