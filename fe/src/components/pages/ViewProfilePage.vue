<template>
  <div v-if="loading" class="spinner" />
  <div v-else-if="error">
    {{error}}
  </div>
  <div v-else-if="userProfileInfo" class="profileHolder">
    <div v-if="userProfileInfo.image">
      <img :src="resolveMediaUrl(userProfileInfo.image)"/>
    </div>
    <div class="tableHolder">
      <table>
        <tbody>
        <tr>
          <th>Username:</th>
          <td>{{username}}</td>
        </tr>
        <tr>
          <th>Name:</th>
          <td>{{userProfileInfo.name}}</td>
        </tr>
        <tr>
          <th>City:</th>
          <td>{{userProfileInfo.city}}</td>
        </tr>
        <tr>
          <th>Surname</th>
          <td>{{userProfileInfo.surname}}</td>
        </tr>
        <tr>
          <th>Email:</th>
          <td>{{userProfileInfo.email}}</td>
        </tr>
        <tr>
          <th>Birthday</th>
          <td>{{userProfileInfo.birthday}}</td>
        </tr>
        <tr>
          <th>Contacts:</th>
          <td>{{userProfileInfo.contacts}}</td>
        </tr>
        <tr>
          <th>Sex:</th>
          <td>{{userProfileInfo.sex}}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import {store} from '@/utils/storeHolder';;
  import {ViewUserProfileDto} from "@/types/messages";
  import {resolveMediaUrl} from '@/utils/htmlApi';
  import {UserModel} from '@/types/model';

  @Component
  export default class ViewProfilePage extends Vue {

    loading: boolean = false;
    error: string = null;
    userProfileInfo: ViewUserProfileDto = null;
    get allUsersDict(): {[id: number]: UserModel}  { return this.store.allUsersDict }

    get id(): number {
      return parseInt(this.$route.params['id']);
    }

    get username(): string {
      return this.allUsersDict[this.id].user;
    }

    resolveMediaUrl(src: string) {
      return resolveMediaUrl(src);
    }

    created() {
      this.loading = true;
      this.$api.showProfile(this.id, (d: ViewUserProfileDto, e: string) => {
        this.loading = false;
        if (e) {
          this.error = `Unable to load ${this.username} profile, because: ${e}`;
        }
        this.userProfileInfo = d;
      });
    }

  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/mixins"

  th
    text-align: right
  th, td
    padding: 0 5px

  .spinner
    @include lds-30-spinner-vertical('Loading user profile...')

  .profileHolder
    display: flex
    flex-direction: row
    > div
      flex-grow: 1
      flex-basis: 0
      padding: 10px

  .tableHolder
    display: flex
    justify-content: center

  img
    width: 100%

  @media screen and (max-width: $collapse-width)
    .profileHolder
      flex-direction: column

</style>
