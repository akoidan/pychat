<template>
  <create-room
    :parent-channel-id="channelId"
    :is-public="true"
    :user-ids="userIds"
  />
</template>
<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator';
import CreateRoom from '@/vue/parts/CreateRoom.vue';
import {State} from '@/ts/instances/storeInstance';
import {
  ChannelsDictUIModel,
  ChannelUIModel
} from '@/ts/types/model';

@Component({
  name: 'ChannelAddRoom',
    components: {
        CreateRoom
    }
})
export default class ChannelAddRoom extends Vue {

  @State
  public readonly channelsDictUI!: ChannelsDictUIModel;

  @State
  public readonly myId!: number;
  get userIds(): number[] {
    return this.channel.mainRoom.users;
  }

  get channel(): ChannelUIModel {
    return this.channelsDictUI[this.channelId];
  }

  get channelId(): number {
      const id = this.$route.params.id;
      this.$logger.log('Rending channel settings for {}', id)();

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
