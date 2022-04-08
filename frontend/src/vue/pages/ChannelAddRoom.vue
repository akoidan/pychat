<template>
  <create-room
    :is-public="true"
    :parent-channel-id="channelId"
    :user-ids="userIds"
  />
</template>
<script lang="ts">
import {
  Component,
  Vue,
} from "vue-property-decorator";
import CreateRoom from "@/vue/parts/CreateRoom.vue";
import {State} from "@/ts/instances/storeInstance";
import type {ChannelUIModel} from "@/ts/types/model";
import {ChannelsDictUIModel} from "@/ts/types/model";

@Component({
  name: "ChannelAddRoom",
  components: {
    CreateRoom,
  },
})
export default class ChannelAddRoom extends Vue {
  @State
  public readonly channelsDictUI!: ChannelsDictUIModel;

  @State
  public readonly myId!: number;

  public get userIds(): number[] {
    return this.channel.mainRoom.users;
  }

  public get channel(): ChannelUIModel {
    return this.channelsDictUI[this.channelId];
  }

  public get channelId(): number {
    const id: string = this.$route.params.id as string;
    this.$logger.log("Rending channel settings for {}", id)();

    return parseInt(id);
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>

</style>
