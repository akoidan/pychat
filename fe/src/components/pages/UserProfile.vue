<template>
  <div class="holder">
    <div class="links">
      <router-link to="/profile/user-info">
        User info
      </router-link>
      <router-link to="/profile/image">
        Profile image
      </router-link>
      <router-link to="/profile/settings">
        Chat settings
      </router-link>
      <router-link to="/profile/change-password">
        Change password
      </router-link>
      <router-link to="/profile/change-email">
        Change email
      </router-link>
    </div>
    <div class="container">
      <keep-alive>
        <router-view class="profileInner"/>
      </keep-alive>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import UserProfileChangePassword from "@/components/pages/UserProfileChangePassword.vue";
import UserProfileImage from "@/components/pages/UserProfileImage.vue";
import UserProfileInfo from "@/components/pages/UserProfileInfo.vue";
import UserProfileSettings from "@/components/pages/UserProfileSettings.vue";

@Component({components: {UserProfileChangePassword,
  UserProfileImage,
  UserProfileInfo,
  UserProfileSettings}})
export default class UserProfile extends Vue {
}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

  .color-white .links a
    color: #c3fffd
    &.router-link-active
      color: #e8e156


  .links
    display: flex
    max-width: 550px
    margin: auto
    margin-top: 10px
    padding: 8px
    justify-content: space-between
    a
      color: $link-color
      &:hover
        cursor: pointer
        text-decoration: underline
      &.router-link-active
        color: #ffc000
        text-decoration: underline

  .profileInner /deep/
    button
      width: 100%
    padding-top: 10px
    padding-bottom: 10px
    table
      margin: auto
    th
      text-align: right
    td, th
      padding: 4px
    .input
      @extend %big-input


</style>
