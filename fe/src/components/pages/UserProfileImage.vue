<template>
  <div>
    <img :src="img">
    <video autoplay="" ref="changeProfileVideo" v-show="showVideo"></video>
    <input type="button" class="green-btn" value="Make a photo from webcam" @click="startCapturingVideo">
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component
  export default class UserProfileImage extends Vue {
    img: string = '';
    showVideo: boolean = false;
    startCapturingVideo() {

    }
  }
</script>

<style lang="sass" scoped>
</style>