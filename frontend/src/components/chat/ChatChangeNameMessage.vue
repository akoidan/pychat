<template>
  <p class="message-system">
    <span class="message-header">
      <span class="timeMess">({{ getTime }})</span>
      <span>System</span>: </span>
      <span class="message-text-style">This room has been renamed from <b>{{ oldName }}</b> to <b>{{ newName }}</b></span>
  </p>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {timeToString} from '@/utils/htmlApi';

@Component
export default class ChatChangeNameMessage extends Vue {
  @Prop() public time!: number;
  @Prop() public oldName!: string;
  @Prop() public newName!: string;

  get getTime() {
    return timeToString(this.time);
  }
}
</script>

<style lang="sass" scoped>
  .color-white .message-system
    background-color: #f2fbff
</style>
