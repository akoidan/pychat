<template>
  <p class="message-system">
    <span class="message-header">
    <span class="timeMess">({{getTime}})</span>
    <span>System</span>: </span>
    <span class="message-text-style">User <b @contextmenu.prevent.stop="setActiveUser">{{user}}</b> has gone {{where}}</span>
  </p>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {UserModel} from "../../types/model";
  import {timeToString} from "../../utils/htmlApi";

  @Component
  export default class ChatChangeOnlineMessage extends Vue {
    @Prop() time: number;
    @Prop() userId: number;
    @Prop() isWentOnline: boolean;
    @Mutation setActiveUserId;

    @State allUsersDict: {[id: number]: UserModel};

    get where () {
      return this.isWentOnline ? "online" : "offline";
    }

    setActiveUser() {
      this.setActiveUserId(this.userId);
    }

    get user () {
      return this.allUsersDict[this.userId].user;
    }

    get getTime() {
      return timeToString(this.time);
    }
  }
</script>

<style lang="sass" scoped>
</style>