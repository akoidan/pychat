<template>
  <div class="app-menu-bar">
    <div class="navMenu">
      <span class="username">User: <b>{{ userInfo.user }}</b></span>
    </div>
    <router-link to="/settings">
      Settings
    </router-link>
    <router-link to="/profile" title="Settings">
      Profile
    </router-link>
    <router-link
      v-if="consts.STATISTICS"
      to="/statistics"
      title="Statistics"
    >
      Statistics
    </router-link>
    <router-link
      v-if="consts.ISSUES"
      to="/report-issue"
      title="Report an issue"
    >
      Issue
    </router-link>
    <a
      v-if="consts.GITHUB_LINK"
      :href="consts.GITHUB_LINK"
      target="_blank"
    >
      Github
    </a>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';
  import {GITHUB_LINK, ISSUES, STATISTICS} from '@/ts/utils/consts';
  import {State} from '@/ts/instances/storeInstance';
  import {CurrentUserInfoModel} from '@/ts/types/model';

  @Component
  export default class AppMenuBar extends Vue {


    @State
    public readonly userInfo!: CurrentUserInfoModel;

    public get consts(): object {
      return {
        GITHUB_LINK,
        ISSUES,
        STATISTICS
      }
    }
  }
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  .app-menu-bar
    position: absolute
    left: 0
    z-index: 3
    background-color: #212122
    bottom: 0
    border: 1px #696951 solid
    top: 0
    padding: 10px
    width: 200px
    display: flex
    flex-direction: column
    > *
      padding: 5px
      font-size: 25px

</style>
