<template>
  <create-room :is-public="true"/>
</template>
<script lang="ts">

  import {Component, Vue} from "vue-property-decorator";
  import CreateRoom from "@/components/pages/parts/CreateRoom"

  @Component({components: {CreateRoom}})
  export default class CreatePublicRoom extends Vue {

  }
</script>
