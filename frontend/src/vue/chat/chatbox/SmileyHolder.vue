<template>
  <div class="smile-parent-holder" @mousedown.prevent>
    <ul class="tabNames">
      <li
        v-for="(_, tabName) in smileys"
        :key="tabName"
        :class="{'activeTab': activeTab === tabName}"
        @mousedown.prevent="activeTab = tabName"
      >
        {{ tabName }}
      </li>
      <li class="holder-icon-cancel">
        <i class="icon-cancel-circled-outline" @click="close"/>
      </li>
    </ul>
    <template v-for="(allSmileys, tabName) in smileys">
      <div
        v-show="activeTab === tabName"
        :key="tabName"
      >
        <img
          class="emoji"
          v-for="(smiley, code) in allSmileys"
          :key="code"
          :src="smiley.src"
          :alt="smiley.alt"
          :code="code"
          @click="addSmiley(code)"
        >
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
  Emit
} from 'vue-property-decorator';
import { smileys } from '@/ts/utils/smileys';

import { State } from '@/ts/instances/storeInstance';

@Component({name: 'SmileyHolder'})
 export default class SmileyHolder extends Vue {

  public smileys = smileys;
  public activeTab: string = Object.keys(smileys)[0];

  @Emit()
  addSmiley(code: string) {
    return code;
  }

  @Emit()
  close() {}

}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"
  @import "~@/assets/sass/partials/mixins"
  @import "~@/assets/sass/partials/variables"

  .emoji
    width: $emoji-width
    cursor: pointer

  .icon-cancel-circled-outline
    position: relative // icon is broken a bit, it occupies 1 px above the screen
    top: 1px
    right: -10px // ignore padding right
    @include hover-click(red)

  .smile-parent-holder
    padding: 10px
    max-height: calc(100vh - 220px)
    overflow: scroll

  .tabNames
    margin: 0
    padding-left: 0
    padding-bottom: 12px
    display: block

    > li
      display: inline-block
      padding-left: 10px
      font-size: 12px
      padding-right: 10px

      &:hover
        cursor: pointer
        text-decoration: underline

    .holder-icon-cancel
      margin-left: auto

    img
      cursor: pointer

  .smile-parent-holder
    @extend %modal-window

  .color-lor
    .activeTab
      color: #fcaf3e

  .color-reg
    .activeTab
      color: #C6B955

  .color-white
    .activeTab
      color: #11970d
</style>
