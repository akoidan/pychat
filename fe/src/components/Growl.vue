<template>
  <div>
    <div>{{this.title}}</div>
  </div>
  <router-view class="view"></router-view>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";

  @Component
  export default class Growl extends Vue {
    @Prop() title: string;
  }
</script>
