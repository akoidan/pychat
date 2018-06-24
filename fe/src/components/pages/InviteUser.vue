<template>

  <create-room :is-public="false"/>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import CreateRoom from "./CreateRoom.vue"

  @Component({components: {CreateRoom}})
  export default class InviteUser extends Vue {

  }
</script>
