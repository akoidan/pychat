<template>
  <div v-if="name && userList.length" class="chat-tagging">
    <!--    mousedown should be used so we don't lose focus from contenteditable-->
    <!--    https://stackoverflow.com/a/8736218/3872976-->
    <div
      v-for="user in userList"
      :key="user.id"
      :class="{'tag-selected': user.id === currentSelected}"
      @mousedown.prevent="emitName(user)"
    >
      {{ user.user }}
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Vue,
  Watch,
} from "vue-property-decorator";
import {
  UserDictModel,
  UserModel,
} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";

@Component({name: "ChatTagging"})
export default class ChatTagging extends Vue {
  @Prop() public name!: string;

  @Prop() public userIds!: number[];

  @State
  public readonly allUsersDict!: UserDictModel;

  public currentSelected: number | null = null;

  public get onlyUserName(): string {
    if (this.name.length > 0) {
      return this.name.substring(1);
    }
    return "";
  }

  public get userList(): UserModel[] {
    return this.userIds.map((id) => this.allUsersDict[id]).filter((u) => u.user.toLowerCase().includes(this.onlyUserName.toLowerCase()));
  }

  @Watch("name")
  onNameChange() {
    this.currentSelected = null;
  }

  @Watch("userIds")
  onUsersInRoomChange() {
    this.currentSelected = null;
  }

  @Watch("allUsersDict")
  onUsersChange() {
    this.currentSelected = null;
  }

  public upArrow() {
    this.navigateKeyBoard((index) => index === 0 ? this.userList.length - 1 : index - 1);
  }

  public downArrow() {
    this.navigateKeyBoard((index) => index === this.userList.length - 1 ? 0 : index + 1);
  }

  public navigateKeyBoard(getNextIndex: (i: number) => number) {
    if (!this.userList.length) {
      return;
    }
    if (!this.currentSelected) {
      this.currentSelected = this.userList[0].id;
      return;
    }
    let index = this.userList.findIndex((a) => a.id === this.currentSelected);
    if (index >= 0) {
      index = getNextIndex(index);
      this.currentSelected = this.userList[index].id;
    } else {
      this.currentSelected = this.userList[0].id;
    }
  }

  public confirm() {
    const user: UserModel = this.userList.find((u) => u.id === this.currentSelected)!;
    this.emitName(user);
  }

  @Emit()
  emitName(user: UserModel) {
    this.currentSelected = null;
    return user;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

.chat-tagging
  @extend %modal-window
  overflow-y: auto
  max-height: 50vh
  padding: 5px

  > div
    padding: 5px

    &:hover
      text-decoration: underline
      color: #ff9e00
      cursor: pointer

    &.tag-selected
      color: yellow
      text-decoration: underline
</style>
