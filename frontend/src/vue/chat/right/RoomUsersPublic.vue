<template>
  <room-users-wrapper :room="room">
    {{ room.name }}
  </room-users-wrapper>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import { RoomModel } from '@/ts/types/model';
import RoomUsersWrapper from '@/vue/chat/right/RoomUsersWrapper.vue';

@Component({
  components: {RoomUsersWrapper}
})
export default class RoomUsersPublic extends Vue {
  @Prop() public room!: RoomModel;

}
</script>
