<template>
  <div class="holder">
    <video :src="callInfo.anchor"></video>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {CallInfoModel} from '../../types/model';

  @Component
  export default class ChatRemotePeer extends Vue {
    @Prop() callInfo: CallInfoModel;
  }
</script>

<style lang="sass" scoped>

  .holder
    border: 1px solid white
</style>