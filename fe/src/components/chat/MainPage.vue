<template>
  <div class="holder">
    <nav-user-show v-if="activeUser" :active-user="activeUser"/>
    <div class="wrapper">
      <div class="chatBoxHolder" @drop.prevent="dropPhoto">
        <keep-alive>
          <router-view/>
        </keep-alive>
        <div v-if="!activeRoom" class="noRoom" >
          <router-link to="/chat/1">This room doesn't exist, or you don't have access to it. Click to go to main room</router-link>
        </div>
      </div>
      <room-users/>
      <smiley-holder v-show="showSmileys" @add-smiley="addSmiley"/>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";
  import {Getter, State} from "vuex-class";
  import RoomUsers from "./RoomUsers.vue"
  import ChatBox from "./ChatBox.vue"
  import SmileyHolder from "./SmileyHolder.vue"
  import {RoomModel} from "../../types/model";
  import NavEditMessage from "./NavEditMessage.vue";
  import NavUserShow from "./NavUserShow.vue";
  import {getSmileyHtml, pasteHtmlAtCaret} from "../../utils/htmlApi";

  @Component({components: {RoomUsers, ChatBox, SmileyHolder, NavEditMessage, NavUserShow}})
  export default class ChannelsPage extends Vue {

    showSmileys: boolean = false;
    @State activeRoomId: number;
    @Getter roomsArray: RoomModel[];
    @Getter activeUser;
    @Getter activeRoom: RoomModel;

    addSmiley(code: string) {
      this.logger.log("Adding smiley {}", code)();
      pasteHtmlAtCaret(getSmileyHtml(code), this.$refs.userMessage);
    }

  }
</script>
<style lang="sass" scoped>

  @import "partials/mixins"
  @import "partials/variables"
  @import "partials/abstract_classes"

  .noRoom
    justify-content: center
    align-items: center
    display: flex
    font-size: 30px
    margin-top: 30px
    > *
      text-align: center
      color: #8fadff
      cursor: pointer
      &:hover
        text-decoration: underline

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


  .chatBoxHolder
    overflow-y: auto
    @include display-flex
    flex: 1
    @include flex-direction(column)
    width: 100%

</style>