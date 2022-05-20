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
      <router-link v-if="GOOGLE_OAUTH_2_CLIENT_ID && FACEBOOK_APP_ID" to="/profile/oauth-settings">
        Social accounts
      </router-link>
    </app-tab>
    <div class="container">
      <router-view v-slot="{Component, route}">
        <keep-alive>
          <component
            :is="Component"
            :key="route.meta.usePathKey ? route.path : undefined"
            class="profileInner"
          />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script lang="ts">
import {FACEBOOK_APP_ID, GOOGLE_OAUTH_2_CLIENT_ID,} from "@/ts/utils/consts";
import {Component, Vue,} from "vue-property-decorator";
import AppTab from "@/vue/ui/AppTab.vue";

@Component({
  name: "UserProfile",
  components: {AppTab},
})
export default class UserProfile extends Vue {
  public readonly GOOGLE_OAUTH_2_CLIENT_ID = GOOGLE_OAUTH_2_CLIENT_ID;

  public readonly FACEBOOK_APP_ID = FACEBOOK_APP_ID;
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"

.holder
  @extend %room-settings-holder

.tab
  max-width: 680px

.profileInner
  :deep(button)
    width: 100%
  padding-top: 10px
  padding-bottom: 10px

  :deep(table)
    margin: auto

  :deep(th)
    text-align: right

  :deep(td), :deep(th)
    padding: 4px

  :deep(.input)
    @extend %big-input


</style>
