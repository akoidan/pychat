<template>
  <div v-show="name" class="chat-tagging">
    <!--    mousedown should be used so we don't lose focus from contenteditable-->
    <!--    https://stackoverflow.com/a/8736218/3872976-->
    <div @mousedown.prevent="emitName(user)" :key="user.id" v-for="user in userList"> {{user.user}}</div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch, Ref, Emit} from 'vue-property-decorator';
import {ChannelUIModel, UserDictModel, UserModel} from '@/ts/types/model';
import {State} from '@/ts/instances/storeInstance';

@Component
export default class ChatTagging extends Vue {
  @Prop() public name!: string;

  @Prop() public userIds!: number[];

  @State
  public readonly allUsersDict!: UserDictModel;

  get onlyUserName(): string {
    if (this.name.length > 0) {
      return this.name.substring(1);
    } else {
      return '';
    }
  }

  get userList(): UserModel[] {
    return this.userIds.map(id => this.allUsersDict[id]).filter(u => u.user.includes(this.onlyUserName))
  }

  @Emit()
  emitName(user: UserModel) {
    return user;

  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .chat-tagging
    @extend %modal-window
    padding: 5px
    > div
      padding: 5px
      &:hover
        text-decoration: underline
        color: yellow
        cursor: pointer
</style>
