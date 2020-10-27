<template>
  <div class="holder">
    <div class="links">
      <router-link to="/create-room/public">
        Create public room
      </router-link>
      <router-link to="/create-room/channel">
        Create channel
      </router-link>
    </div>
    <keep-alive>
      <router-view class="create-room-inner"/>
    </keep-alive>
  </div>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class CreateRoomChannel extends Vue {

}
</script>
<style lang="sass" scoped>
  @import "~@/assets/sass/partials/variables"
  @import "~@/assets/sass/partials/abstract_classes"

  .create-room-inner
    max-width: 268px
    margin: auto

  .create-room-holder
    display: flex
    flex-direction: column


  .color-white .links a
    color: #c3fffd
    &.router-link-active
      color: #e8e156


  .links
    display: flex
    max-width: 265px
    margin: auto
    margin-top: 10px
    padding: 8px
    justify-content: space-between
    a
      color: $link-color
      &:hover
        cursor: pointer
        text-decoration: underline
      &.router-link-active
        color: #ffc000
        text-decoration: underline
</style>
