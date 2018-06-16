<template>
  <div>
    <app-nav v-if="userInfo"/>
    <router-view/>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import AppNav from "./AppNav.vue";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {globalLogger, ws} from '../../utils/singletons';

  @Component({
    components: {AppNav}
  })
  export default class MainPage extends Vue {

    @State userInfo;

    created() {
      ws.startListening();
      globalLogger.log("Rendering mainPage")();
    }

    destroy() {
      ws.stopListening();
    }
  }
</script>

<style lang="sass" scoped>
</style>