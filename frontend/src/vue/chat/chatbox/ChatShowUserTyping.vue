<template>
  <div v-if="users.length > 0" class="users-typing-holder">
    <span class="user-types"> {{stringifiedTypes}}</span><span v-if="users.length > 1"> are</span><span v-else> is</span> <span class="loading-typing">typing</span>
  </div>
</template>
<script lang="ts">
  import {
    Component,
    Prop,
    Vue,
    Watch,
    Ref
  } from 'vue-property-decorator';
  import {
    RoomModel,
    UserModel
  } from '@/ts/types/model';
  import {State} from '@/ts/instances/storeInstance';

  @Component
  export default class ChatShowUserTyping extends Vue {
    @Prop() public usersTyping!: Record<number, number>;

    @State
    public readonly allUsersDict!: {[id: number]: UserModel} ;

    get users(): UserModel[] {
      return Object.keys(this.usersTyping).map(uId => this.allUsersDict[uId as unknown as number]);
    }

    get stringifiedTypes() {
      return this.users.map(u => u.user).join(', ');
    }
  }
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
  .user-types
    color: cornflowerblue

  .users-typing-holder
    color: #969696
    padding: 5px 5px 0 10px


  .loading-typing:after // https://stackoverflow.com/a/28074607/3872976
    overflow: hidden
    display: inline-block
    vertical-align: bottom
    -webkit-animation: ellipsis steps(4,end) 1200ms infinite
    animation: ellipsis steps(4,end) 1200ms infinite
    content: "\2026" /* ascii code for the ellipsis character */
    width: 0px


  @keyframes ellipsis
    to
      width: 20px


  @-webkit-keyframes ellipsis
    to
      width: 20px

</style>
