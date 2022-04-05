<template>
  <router-link :to="link" class="icon-left"/>
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {State} from "@/ts/instances/storeInstance";
import {ALL_ROOM_ID} from "@/ts/utils/consts";

@Component({name: "ChatBackIcon"})
export default class ChatBackIcon extends Vue {
  @State
  public readonly activeRoomId!: number;

  public get link() {
    return `/chat/${this.activeRoomId || ALL_ROOM_ID}`;
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
.icon-left
  cursor: pointer
</style>
