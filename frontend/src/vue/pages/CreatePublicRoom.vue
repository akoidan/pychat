<template>
  <create-room
    :is-public="true"
    :user-ids="userIds"
  />
</template>
<script lang="ts">
  import {
    Component,
    Vue
  } from 'vue-property-decorator';
  import CreateRoom from '@/vue/pages/parts/CreateRoom.vue';
  import {State} from '@/ts/instances/storeInstance';

  @Component({components: {CreateRoom}})
export default class CreatePublicRoom extends Vue {


  @State
  public readonly myId!: number;
  get userIds(): number[] {
    return this.$store.usersArray
        .map(a=> a.id)
        .filter(uId => uId !== this.myId);
  }
}
</script>
