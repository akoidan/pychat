<template>
  <div class="holder">
    <app-tab class="tab">
      <router-link to="/profile/user-info">
        User info
      </router-link>
      <router-link to="/profile/image">
        Profile image
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
    </app-tab>
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
import AppTab from '@/vue/ui/AppTab.vue';
@Component({
  name: 'UserProfile' ,
  components: {AppTab}
})
export default class UserProfile extends Vue {
  private readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;
  private readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;

}
</script>

<style lang="sass" scoped>

  @import "@/assets/sass/partials/variables"
  @import "@/assets/sass/partials/abstract_classes"

  .holder
    @extend %room-settings-holder
  .tab
    max-width: 680px

  .profileInner ::v-deep
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
