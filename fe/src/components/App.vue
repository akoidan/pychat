<template>
  <div :class="theme">
    <div class="growlHolder">
      <growl v-for="growl in growls" :title="growl.title" :key="growl.id"></growl>
    </div>
    <router-view class="view"></router-view>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import Growl from "./Growl";
  import {State} from "vuex-class";

  @Component({
    components: {Growl}
  })
  export default class App extends Vue {
    @State growls: string[];
    @State theme;

  }
</script>
