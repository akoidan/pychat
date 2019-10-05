<template>
  <p class="message-system">
    <span class="message-header">
    <span class="timeMess">({{getTime}})</span>
    <span>System</span>: </span>
    <span class="message-text-style">{{isUser}} <b @contextmenu.prevent.stop="setActiveUser">{{user}}</b> {{where}}</span>
  </p>
</template>
<script lang="ts">
  import {store} from '@/utils/storeHolder';
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CurrentUserInfoModel, UserModel} from "@/types/model";
  import {timeToString} from "@/utils/htmlApi";

  @Component
  export default class ChatChangeOnlineMessage extends Vue {
    @Prop() time: number;
    @Prop() userId: number;
    @Prop() isWentOnline: boolean;

    get allUsersDict(): {[id: number]: UserModel}  { return store.allUsersDict }
    get myId(): number  { return store.myId };

    get where () {
      let has = this.isMe ? "have " : "has ";
      return has + (this.isWentOnline ?  "appeared online" : "gone offline");
    }

    setActiveUser() {
      store.setActiveUserId(this.userId);
    }

    get isUser() {
      return this.isMe ? '': 'User';
    }

    get user () {
      return this.isMe ? 'You' : this.allUsersDict[this.userId].user;
    }

    get isMe() {
      return this.userId === this.myId;
    }

    get getTime() {
      return timeToString(this.time);
    }
  }
</script>

<style lang="sass" scoped>
  .color-white .message-system
    background-color: #f2fbff
</style>
