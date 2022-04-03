<template>
  <app-modal>
    <div class="app-menu-bar">
      <div class="app-header">
        <span class="username">
          <img v-if="imgSrc" :src="imgSrc"/>
          <div class="user-name">{{ userInfo.user }}</div>
        </span>
      </div>
      <div class="app-section">
        <router-link
            title="Create a new group of rooms"
            to="/create-private-room"
        >
          Write to user
        </router-link>
        <router-link
            title="Create a new group of rooms"
            to="/create-group"
        >
          Create group
        </router-link>
        <router-link title="Settings" to="/profile">
          Profile
        </router-link>
        <router-link to="/settings">
          Settings
        </router-link>
        <router-link
            v-if="consts.ISSUES"
            title="Report an issue"
            to="/report-issue"
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
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {
  GITHUB_LINK,
  ISSUES,
} from "@/ts/utils/consts";
import { State } from "@/ts/instances/storeInstance";
import { CurrentUserInfoModel } from "@/ts/types/model";
import AppModal from "@/vue/ui/AppModal.vue";
import { resolveMediaUrl } from "@/ts/utils/htmlApi";

@Component({
  name: "AppMenuBar",
  components: {
    AppModal,
  },
})
export default class AppMenuBar extends Vue {
  @State
  public readonly userInfo!: CurrentUserInfoModel;

  get imgSrc() {
    return resolveMediaUrl(this.userInfo.image);
  }

  public get consts(): { GITHUB_LINK: string; ISSUES: string } {
    return {
      GITHUB_LINK,
      ISSUES,
    };
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
