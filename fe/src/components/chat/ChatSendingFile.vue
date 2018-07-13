<template>
  <div>Sending files ollo</div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {SendingFile} from "../../types/model";

  @Component
  export default class ChatSendingFile extends Vue {
    @Prop() sendingFile: SendingFile;
  }
</script>

<style lang="sass" scoped>
</style>