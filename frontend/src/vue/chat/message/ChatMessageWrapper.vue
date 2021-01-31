<template>
  <p>
    <slot name="header" />
    <slot name="default" />
    <span class="time">{{ getTime }}</span>
  </p>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue
  } from 'vue-property-decorator';
  import {timeToString} from '@/ts/utils/htmlApi';

  @Component
  export default class ChatMessageWrapper extends Vue {
    @Prop()
    private readonly time!: number;


    get getTime() {
      return timeToString(this.time);
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  .time
    float: right
    color: #878787
    font-size: 12px
    position: absolute
    bottom: 0
    right: 0

</style>
