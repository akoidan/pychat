<template>

  <div>
    <div>{{title}}</div>
  </div>
</template>

<script lang='ts'>
  import {Vue, Component, Prop} from "vue-property-decorator";

  @Component
  export default class Growl extends Vue {
    @Prop() title: string;
  }
</script>

