<template>
  <app-modal>
    <div class="app-menu-bar">
      <div class="app-header">
        <span class="username">
          <img :src="imgSrc" v-if="imgSrc"/>
          <div class="user-name">{{ userInfo.user }}</div>
        </span>
      </div>
      <div class="app-section">
        <router-link
          to="/create-private-room"
          title="Create a new group of rooms"
        >
          Write to user
        </router-link>
        <router-link
          to="/create-group"
          title="Create a new group of rooms"
        >
          Create group
        </router-link>
        <router-link to="/profile" title="Settings">
          Profile
        </router-link>
        <router-link to="/settings">
          Settings
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
    </div>
  </app-modal>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch, Ref, Emit} from 'vue-property-decorator';
  import {GITHUB_LINK, ISSUES, STATISTICS} from '@/ts/utils/consts';
  import {State} from '@/ts/instances/storeInstance';
  import {CurrentUserInfoModel} from '@/ts/types/model';
  import AppModal from '@/vue/ui/AppModal.vue';
  import {resolveMediaUrl} from '@/ts/utils/htmlApi';

  @Component({
    name: 'AppMenuBar',
    components: {
      AppModal
    }
  })
  export default class AppMenuBar extends Vue {

    @State
    public readonly userInfo!: CurrentUserInfoModel;

    get imgSrc() {
      return this.userInfo.image? resolveMediaUrl(this.userInfo.image): null;
    }

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
    font-size: 25px
    background-color: #212122
    border: 1px #696951 solid
    width: 200px
  .user-name
    font-size: 17px
    font-weight: bold
    margin-top: 5px
  img
    border-radius: 50%
    width: 100px
    max-height: 120px
  %app-common
    padding: 10px
  .app-header
    background-color: #353535
    padding: 10px 15px 5px
    @extend %app-common
  .app-section
    @extend %app-common
    display: flex
    flex-direction: column
    > *
      padding: 5px
      &:hover
        color: #f0f0f0

</style>
