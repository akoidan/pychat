<template>
  <form method="post" @submit="saveProfile">
    <div class="padding10">
      <table class="biginputtext" id="userProfileData">
        <tbody>
        <tr>
          <th><label for="id_username">Username:</label></th>
          <td><input id="id_username" maxlength="30" name="username" type="text" value="AAdmin"></td>
        </tr>
        <tr>
          <th><label for="id_name">Name:</label></th>
          <td><input id="id_name" maxlength="30" name="name" type="text" value="Andrew"></td>
        </tr>
        <tr>
          <th><label for="id_city">City:</label></th>
          <td><input id="id_city" maxlength="50" name="city" type="text" value="Chernihiv"></td>
        </tr>
        <tr>
          <th><label for="id_surname">Surname:</label></th>
          <td><input id="id_surname" maxlength="30" name="surname" type="text"></td>
        </tr>
        <tr>
          <th><label for="id_email">Email:</label></th>
          <td><input id="id_email" maxlength="190" name="email" type="email" value="deathangel908@gmail.com"></td>
        </tr>
        <tr>
          <th><label for="id_birthday">Birthday:</label></th>
          <td><input id="id_birthday" name="birthday" type="date" value="1991-09-21"></td>
        </tr>
        <tr>
          <th><label for="id_contacts">Contacts:</label></th>
          <td><input id="id_contacts" maxlength="100" name="contacts" type="text"></td>
        </tr>
        <tr>
          <th><label for="id_sex">Sex:</label></th>
          <td><select id="id_sex" name="sex">
            <option value="1" selected="selected">Male</option>
            <option value="2">Female</option>
            <option value="0">Alien</option>
          </select></td>
        </tr>
        </tbody>
      </table>
    </div>
  </form>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class UserProfileInfo extends Vue {

  }
</script>

<style lang="sass" scoped>
</style>