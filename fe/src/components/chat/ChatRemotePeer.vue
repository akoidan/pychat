<template>
  <div class="holder">
    <video :src="callInfo.anchor" ref="video"></video>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {CallInfoModel} from '../../types/model';

  @Component
  export default class ChatRemotePeer extends Vue {
    @Prop() callInfo: CallInfoModel;

    $refs : {
      video: HTMLVideoElement
    };

    @Watch('callInfo.anchor')
    onAnchorChanged(value) {
      this.$nextTick(function () {
        if (value) {
          this.$refs.video.play();
        } else {
          this.$refs.video.pause();
        }
      })
    }
  }
</script>

<style lang="sass" scoped>

  .holder
    border: 1px solid white
</style>