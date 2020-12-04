<template>
  <div class="holder">
    <nav-edit-message/>
    <nav-user-show/>
    <div class="wrapper">
      <chat-boxes />
      <chat-recording
        :src-video="srcVideo"
        :recording-now="recordingNow"
      />
      <chat-right-section />
      <chat-attachments/>
      <smiley-holder />
    </div>
    <chat-text-area
      :src-video.sync="srcVideo"
      :recording-now.sync="recordingNow"
    />
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue
} from 'vue-property-decorator';

import ChatRightSection from '@/vue/chat/ChatRightSection.vue';
import SmileyHolder from '@/vue/chat/SmileyHolder.vue';
import NavEditMessage from '@/vue/chat/NavEditMessage.vue';
import NavUserShow from '@/vue/chat/NavUserShow.vue';

import {
  RawLocation,
  Route
} from 'vue-router';
import ChatRecording from '@/vue/chat/ChatRecording.vue';
import ChatTextArea from '@/vue/chat/ChatTextArea.vue';
import ChatBoxes from '@/vue/chat/ChatBoxes.vue';
import ChatAttachments from '@/vue/chat/ChatAttachments.vue';


@Component({components: {
    ChatAttachments,
  ChatBoxes,
  ChatTextArea,
  ChatRecording,
  ChatRightSection,
  SmileyHolder,
  NavEditMessage,
  NavUserShow
}})
export default class ChannelsPage extends Vue {

  public recordingNow: boolean = false;
  public srcVideo: string|null = null;

}
</script>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

  .holder
    display: flex
    flex-direction: column

  .wrapper
    @include flex(1)
    @include display-flex
    min-height: 0
    overflow-y: auto
    position: relative
    @media screen and (max-width: $collapse-width)
      flex-direction: column-reverse

</style>
