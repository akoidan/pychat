<template>
  <div class="body flex">
    <app-nav/>
    <keep-alive>
      <router-view class="body"/>
    </keep-alive>
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