<template>
  <div></div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";
  import ChannelsRoom from "./ChannelsRoom.vue"

  @Component()
  export default class App extends Vue {
    @State growls: string[];
    @State theme;

  }
</script>
<style lang="sass" scoped>

</style>