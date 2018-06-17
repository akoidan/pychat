<template>
  <div class="body flex">
    <app-nav v-if="userInfo"/>
    <router-view class="body"/>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import AppNav from "./AppNav.vue";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {globalLogger, ws} from '../utils/singletons';

  @Component({
    components: {AppNav}
  })
  export default class MainPage extends Vue {

    @State userInfo;

    created() {
      ws.startListening();
    }

    destroy() {
      ws.stopListening();
    }
  }
</script>

<style lang="sass" scoped>
  @import "../assets/sass/partials/mixins"
  .flex
    @include display-flex()
    flex-direction: column
</style>