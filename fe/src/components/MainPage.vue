<template>
  <div class="body flex">
    <app-nav v-show="showNav"/>
    <keep-alive>
      <router-view class="body"/>
    </keep-alive>
  </div>
</template>
<script lang="ts">
  import {Getter, Action, Mutation} from "vuex-class";
  import AppNav from "./AppNav.vue";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {globalLogger, ws} from '../utils/singletons';

  @Component({
    components: {AppNav}
  })
  export default class MainPage extends Vue {

    @Getter showNav: boolean;

    created() {
      ws.startListening();
    }

    destroy() {
      ws.stopListening();
    }
  }
</script>

<style lang="sass" scoped>
  @import "partials/mixins"
  @import "partials/abstract_classes"
  .flex
    @include display-flex()
    flex-direction: column

  nav
    @extend %nav

</style>