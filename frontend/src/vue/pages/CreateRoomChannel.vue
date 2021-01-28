<template>
  <div class="holder">
    <app-tab class="links">
      <router-link to="/create-room/public">
        Create public room
      </router-link>
      <router-link to="/create-room/channel">
        Create group
      </router-link>
    </app-tab>
    <keep-alive>
      <router-view class="create-room-inner"/>
    </keep-alive>
  </div>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import AppTab from '@/vue/ui/AppTab.vue';
@Component({
  components: {AppTab}
})
export default class CreateRoomChannel extends Vue {

}
</script>
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

  .create-room-inner
    max-width: 268px
    margin: auto

  .links
    max-width: 265px
</style>
