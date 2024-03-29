<template>
  <div class="controls">
    <div>{{ text }}</div>
    <div class="spanHo">
      <span
        v-for="currentUser in valueUsers"
        :key="currentUser.id"
        class="spann"
      >{{ currentUser.user }}
        <i
          class="icon-cancel"
          @click="removeUser(currentUser.id)"
        />
      </span>
    </div>
    <template v-if="showAddUsersComp">
      <input
        v-model="search"
        class="input"
        placeholder="Search"
        title="Filter by username"
        type="search"
      />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id">
          <user-row :user="user" @click.native="addUser(user.id)"/>
        </li>
      </ul>
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import type {UserModel} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";
import UserRow from "@/vue/chat/right/UserRow.vue";

@Component({
  name: "PickUser",
  components: {UserRow},
})
export default class PickUser extends Vue {
  @Prop() public modelValue!: number[];

  @Prop() public text!: string;

  @Prop() public usersIds!: number[];

  @Prop({default: true}) public showInviteUsers!: boolean;

  @State
  public readonly allUsersDict!: Record<number, UserModel>;

  public search: string = "";

  public get valueUsers(): UserModel[] {
    return this.modelValue.map((id) => this.allUsersDict[id]);
  }

  public get displayedUserIds(): number[] {
    return this.usersIds.filter((a) => !this.modelValue.includes(a));
  }

  public get displayedUsers(): UserModel[] {
    return this.displayedUserIds.map((id) => this.allUsersDict[id]);
  }

  public get showAddUsersComp() {
    return this.showInviteUsers && this.displayedUserIds.length > 0;
  }

  public get filteredUsers(): UserModel[] {
    this.$logger.debug("Reeval filter CreatePrivateRoom")();
    const s = this.search.toLowerCase();

    return this.displayedUsers.filter((u) => u.user.toLowerCase().includes(s));
  }

  public removeUser(id: number) {
    this.modelValue.splice(this.modelValue.indexOf(id), 1);
  }

  public addUser(id: number) {
    this.search = "";
    this.modelValue.push(id);
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"
.spann
  @extend %hovered-user-room

.controls
  display: flex
  flex-direction: column

  > *
    margin-bottom: 5px

.icon-cancel
  cursor: pointer

.color-reg .icon-cancel
  @include hover-click($red-cancel-reg)

.color-lor .icon-cancel
  color: #a94442

.spanHo
  max-width: 300px
  max-height: calc(50vh - 100px)
  overflow: auto

ul
  min-height: 50px
  width: 100%
  max-height: calc(50vh - 100px)
  margin-top: 5px
  overflow-y: scroll
  padding-left: 0

li
  padding: 0 0 0 5px
  border-radius: 2px
  text-overflow: ellipsis
  overflow: hidden
  text-align: left
  white-space: nowrap
  @extend %hovered-user-room
</style>
