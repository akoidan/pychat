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
      <router-link to="/profile/oauth-settings" v-if="GOOGLE_OAUTH_2_CLIENT_ID && FACEBOOK_APP_ID">
        Social accounts
      </router-link>
    </div>
    <div class="container">
      <keep-alive>
        <router-view class="profileInner" />
      </keep-alive>
    </div>
  </div>
</template>
<script lang="ts">
import { GOOGLE_OAUTH_2_CLIENT_ID , FACEBOOK_APP_ID} from '@/ts/utils/consts';
import {Component, Vue} from 'vue-property-decorator';


@Component
export default class UserProfile extends Vue {
  private readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;
  private readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;

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
    max-width: 680px
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
