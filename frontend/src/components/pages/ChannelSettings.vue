<template>
  <div class="top-div">
    <form
        class="holder"
        v-if="channel"
        @submit.prevent="apply"
    >
      <table>
        <tbody>
        <tr>
          <th>
            Name
          </th>
          <td>
            <input
                v-model="channelName"
                type="text"
                required="true"
                class="input"
                maxlength="16"
            >
          </td>
        </tr>
        <tr v-if="showDelete">
          <td colspan="2">
            <app-submit
                type="button"
                class="red-btn"
                value="DELETE THIS CHANNEL"
                :running="running"
                @click.native="deleteChannel"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <app-submit
                value="APPLY SETTINGS"
                class="green-btn"
                :running="running"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </form>
    <div v-else>
      Channel #{{ channelId }} doesn't exist
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {
    ChannelModel,
    ChannelsDictModel, ChannelsDictUIModel, ChannelUIModel,
    RoomDictModel,
    RoomModel
  } from '@/types/model';
  import {State} from '@/utils/storeHolder';
  import AppSubmit from '@/components/ui/AppSubmit.vue';
  import {ApplyGrowlErr} from '@/utils/utils';

  @Component({
    components: {AppSubmit}
  })
  export default class ChannelSettings extends Vue {

    public running: boolean = false;

    public channelName!: string;

    @State
    public readonly channelsDictUI!: ChannelsDictUIModel;

    get channel(): ChannelUIModel {
      return this.channelsDictUI[this.channelId];
    }

    get showDelete(): boolean {
      return this.channel.rooms.length === 0;
    }


    @ApplyGrowlErr({runningProp: 'running'})
    async apply() {
      await this.$ws.saveChannelSettings(this.channelName, this.channelId);
      this.store.growlSuccess('Settings has been saved');
      this.$router.go(-1);
    }

    get channelId(): number {
      const id = this.$route.params.id;
      this.logger.log('Rending channel settings for {}', id)();

      return parseInt(id);
    }


    @ApplyGrowlErr({runningProp: 'running'})
    public async deleteChannel(): Promise<void> {
      await this.$ws.sendDeleteChannel(this.channelId);
      this.store.growlSuccess('Channel has been deleted');
      this.$router.go(-1);
    }

    created() {
      this.logger.log('Updated for room settings {} ', this.channel)();
      if (this.channel) {
        this.channelName = this.channel.name;
      }
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  .top-div
    display: flex
    justify-content: center

  .holder
    overflow-y: auto
    display: flex
    justify-content: center
    align-items: center

    input[type=text]
      width: 150px

    th
      text-align: right
    th, td
      padding: 5px
    td
      text-align: center
      > *
        margin: auto
      &[colspan="2"] > *
        width: 100%
</style>
