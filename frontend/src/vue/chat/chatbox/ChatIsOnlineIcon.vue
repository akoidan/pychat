<template>
  <span
    :class="{online: isOnline, offline: !isOnline}"
    :title="title"
    class="online-status"
  >●</span>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";

@Component({name: "ChatIsOnlineIcon"})
export default class ChatIsOnlineIcon extends Vue {
  @State
  public readonly isOnline!: boolean;

  public get title() {
    return this.isOnline ? "Websocket connection established. You are online" : "Trying to connect to the server. You're offline";
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

.online-status
  padding: 0 10px

.color-lor
  .online-status
    padding: 0 10px

    &.offline
      color: #b02e2e

    &.online
      color: #53a045

    [class^='icon-']:hover
      text-shadow: 0 0 0.2em #FFF, 0 0 0.2em #3D3D3D

.color-reg
  .online-status
    &.offline
      color: #ee2d2d

    &.online
      color: #53a045

.color-white
  .online-status
    &.online
      color: green

    &.offline
      color: red
</style>
