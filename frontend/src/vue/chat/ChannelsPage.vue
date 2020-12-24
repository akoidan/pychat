<template>
  <div class="holder">
<!--    <nav-edit-message/>-->
    <nav-user-show/>
    <div class="wrapper">
      <chat-boxes />
      <chat-right-section />
    </div>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue
} from 'vue-property-decorator';

import ChatRightSection from '@/vue/chat/ChatRightSection.vue';
import SmileyHolder from '@/vue/chat/SmileyHolder.vue';
// import NavEditMessage from '@/vue/chat/NavEditMessage.vue';
import NavUserShow from '@/vue/chat/NavUserShow.vue';

import {
  RawLocation,
  Route
} from 'vue-router';
import ChatTextArea from '@/vue/chat/ChatTextArea.vue';
import ChatBoxes from '@/vue/chat/ChatBoxes.vue';
import ChatAttachments from '@/vue/chat/ChatAttachments.vue';
import {State} from '@/ts/instances/storeInstance';


@Component({components: {
  ChatAttachments,
  ChatBoxes,
  ChatTextArea,
  ChatRightSection,
  SmileyHolder,
  // NavEditMessage,
  NavUserShow
}})
export default class ChannelsPage extends Vue {


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
