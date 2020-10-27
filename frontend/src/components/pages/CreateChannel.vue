<template>
  <div class="holder">
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
                class="input"
                maxlength="16"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <app-submit
        type="button"
        value="Create Channel"
        class="green-btn"
        :running="running"
        @click.native="add"
    />
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {AddChannelMessage, AddRoomMessage} from '@/types/messages';
  import AppSubmit from '@/components/ui/AppSubmit.vue';
  import {ALL_ROOM_ID} from '@/utils/consts';

  @Component({components: {AppSubmit}})
  export default class CreateChannel extends Vue {
    public channelName: string = '';
    public running: boolean = false;

    public add() {
      if (!this.channelName) {
        this.store.growlError('Please specify a channel name');
      } else {
        this.running = true;
        this.$ws.sendAddChannel(this.channelName, (e: AddChannelMessage) => {
          this.running = false;
          this.store.growlSuccess(`Channel '${this.channelName}' has been created`);
          this.$router.replace(`/chat/${ALL_ROOM_ID}`);
        });
      }
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"

  input[type="text"]
    width: 100%

  .holder
    @extend %room-settings-holder

  th, td
    padding: 5px

  .green-btn
    width: 100%
    flex-shrink: 0
</style>
