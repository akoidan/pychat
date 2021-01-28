<template>
  <div>
    <app-tab class="links">
      <router-link :to="`/channel/${channelId}/settings`">
        General
      </router-link>
      <router-link :to="`/channel/${channelId}/room`">
        Add room
      </router-link>
    </app-tab>
    <div>
      <keep-alive>
        <router-view class="create-room-inner" />
      </keep-alive>
    </div>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  import CreateRoom from '@/vue/pages/parts/CreateRoom.vue';
  import AppTab from '@/vue/ui/AppTab.vue';

  @Component({
    components: {AppTab, CreateRoom}
  })
  export default class ChannelConfigurationPage extends Vue {

    get channelId(): number {
      const id = this.$route.params.id;
      this.$logger.log('Rending room settings for {}', id)();

      return parseInt(id);
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>

  .create-room-inner
    max-width: 268px
    margin: auto

  .links
    max-width: 180px
</style>
