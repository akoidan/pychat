<template>

</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";

  @Component()
  export default class ChannelsRoom extends Vue {
    @State growls: string[];
    @State theme;

  }
</script>
<style lang="sass" scoped>

</style>