<template>
  <create-room :is-public="false" />
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import CreateRoom from "@/components/pages/parts/CreateRoom"

  @Component({components: {CreateRoom}})
  export default class CreatePrivateRoom extends Vue {

  }
</script>
