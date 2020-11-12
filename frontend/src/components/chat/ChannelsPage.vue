<template>
  <div class="holder">
    <nav-edit-message/>
    <nav-user-show/>
    <div class="wrapper">
      <chatboxes />
      <chat-recording
        :src-video="srcVideo"
        :recording-now="recordingNow"
      />
      <chat-right-section />
      <smiley-holder/>
    </div>
    <chat-text-area
      :src-video.sync="srcVideo"
      :recording-now.sync="recordingNow"
    />
  </div>
</template>

<script lang='ts'>
import {Component, Vue} from 'vue-property-decorator';

import ChatRightSection from '@/components/chat/ChatRightSection';
import SmileyHolder from '@/components/chat/SmileyHolder';
import NavEditMessage from '@/components/chat/NavEditMessage';
import NavUserShow from '@/components/chat/NavUserShow';
import {messageBus} from '@/utils/singletons';
import {RawLocation, Route} from 'vue-router';
import ChatRecording from '@/components/chat/ChatRecording';
import ChatTextArea from '@/components/chat/ChatTextArea';
import Chatboxes from '@/components/chat/Chatboxes';


@Component({components: {
  Chatboxes,
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

  public beforeRouteEnter(to: Route, frm: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) {
    next(vm => {
      messageBus.$emit('main-join');
    });
  }

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
