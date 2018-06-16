<template>
  <div>
    <div id="wrapper" class="max-height-scrollable hidden">
      <div id="chatBoxHolder" class="max-height-scrollable">
      </div>
      <room-users/>
      <div id="smileParentHolder" class="padding10 hidden">
        <ul id="tabNames"></ul>
      </div>
    </div>

    <div id="userMessageWrapper" class="hidden" style="position: relative">
      <input type="file" accept="image/*,video/*" id="imgInput" multiple="multiple" class="hidden"/>
      <i class="icon-picture" id="imgInputIcon" title="Share Video/Image"></i>
      <i class="icon-smile" title="Add a smile :)" id="iconSmile"></i>
      <div contenteditable="true" id="usermsg" onkeydown="channelsHandler.checkAndSendMessage(event)"></div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {State} from "vuex-class";
  import ChannelsRoom from "./ChannelsRoom.vue"
  import RoomUsers from "./RoomUsers.vue"

  @Component({components: {RoomUsers}})
  export default class App extends Vue {
    @State growls: string[];
    @State theme;

  }
</script>
<style lang="sass" scoped>

</style>