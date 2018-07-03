<template>
  <app-spinner v-if="loading" :text="`Fetching ${username} profile...`"/>
  <div v-else-if="error">
    {{error}}
  </div>
  <div v-else-if="userProfileInfo">
    <img :src="resolveUrl(userProfileInfo.image)"/>
    <div>
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
  import {State} from 'vuex-class';
  import AppSpinner from "../ui/AppSpinner";
  import {ViewUserProfileDto} from "../../types/messages";
  import {resolveUrl} from '../../utils/htmlApi';
  import {UserModel} from '../../types/model';

  @Component({
    components: {AppSpinner}
  })
  export default class ViewProfilePage extends Vue {

    loading: boolean = false;
    error: string = null;
    userProfileInfo: ViewUserProfileDto = null;
    @State allUsersDict: {[id: number]: UserModel};

    get id(): number {
      return parseInt(this.$route.params['id']);
    }

    get username(): string {
      return this.allUsersDict[this.id].user;
    }

    resolveUrl(src: string) {
      return resolveUrl(src);
    }

    created() {
      this.loading = true;
      this.$api.showProfile(this.id, (d: ViewUserProfileDto, e: string) => {
        this.loading = false;
        this.error = e;
        this.userProfileInfo = d;
      });
    }

  }
</script>

<style lang="sass" scoped>
  img
    padding: 10px
</style>