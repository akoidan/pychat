<template>
  <create-room :is-public="true"/>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import CreateRoom from "./CreateRoom.vue"

  @Component({components: {CreateRoom}})
  export default class CreatePrivateRoom extends Vue {

  }
</script>
