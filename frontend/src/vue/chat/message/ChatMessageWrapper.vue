<template>
  <p>
    <slot name="header"/>
    <slot name="default"/>
    <span class="time">{{ getTime }}</span>
  </p>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {timeToString} from "@/ts/utils/htmlApi";

@Component({name: "ChatMessageWrapper"})
export default class ChatMessageWrapper extends Vue {
  @Prop()
  private readonly time!: number;


  public get getTime() {
    return timeToString(this.time);
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
p
  position: relative
  margin: 0
  padding: 2px 0

.time
  float: right
  color: #878787
  font-size: 12px
  z-index: 1
  // above message-tooltip
  position: absolute
  bottom: 0
  right: 5px

</style>
