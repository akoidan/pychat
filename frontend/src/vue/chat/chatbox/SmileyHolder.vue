<template>
  <div
    class="smile-parent-holder"
    @mousedown="mouseDownMain"
  >
    <ul class="tabNames">
      <li
        v-for="(_, tabName) in smileys"
        :key="tabName"
        :class="{'activeTab': activeTab === tabName}"
        @mousedown.prevent="setTabName(tabName)"
      >
        {{ tabName }}
      </li>
      <li>
        <input
          v-model="searchSmile"
          type="search"
          class="input"
          placeholder="search smile"
        >
      </li>
      <li class="holder-icon-cancel">
        <i
          class="icon-cancel-circled-outline"
          @click="close"
        />
      </li>
    </ul>
    <div v-if="showFilterSmiley">
      <img
        v-for="(smiley, code) in filterSmiley"
        :key="code"
        class="emoji"
        :src="smiley.src"
        :alt="smiley.alt"
        :code="code"
        @click="addSmileyClick(code)"
      >
    </div>
    <template v-for="(allSmileys, tabName) in smileys">
      <div
        v-show="activeTab === tabName && !showFilterSmiley"
        :key="tabName"
      >
        <img
          v-for="(smiley, code) in allSmileys"
          :key="code"
          class="emoji"
          :src="smiley.src"
          :alt="smiley.alt"
          :code="code"
          @click="addSmileyClick(code)"
        >
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Vue,
  Emit,
  Watch
} from 'vue-property-decorator';
import {
  Smile,
  SmileVariation,
  smileys
} from '@/ts/utils/smileys';
import {
  allSmileysKeys,
  allSmileysKeysNoVariations
} from '@/ts/utils/htmlApi';

import { State } from '@/ts/instances/storeInstance';

@Component({name: 'SmileyHolder'})
 export default class SmileyHolder extends Vue {

  public smileys = smileys;
  public activeTab: string = Object.keys(smileys)[0];
  public skinVariations: Record<string, SmileVariation> = {};
  public searchResults: Record<string, SmileVariation> = {};
  public searchSmile: string = '';


  get filterSmiley() {
    if (Object.keys(this.skinVariations).length > 0) {
      return this.skinVariations;
    }
    if (Object.keys(this.searchResults).length > 0) {
      return this.searchResults;
    }
    return {};
  }

  get showFilterSmiley() {
    return Object.keys(this.skinVariations).length > 0 || Object.keys(this.searchResults).length > 0 || this.searchSmile;
  }

  mouseDownMain(e: MouseEvent) {
    if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
      e.preventDefault();
    }
  }

  @Watch('searchSmile')
  searchSmileChange() {
    if (!this.searchSmile) {
      this.searchResults = {};
      return;
    }
    this.searchResults = Object.entries(allSmileysKeysNoVariations)
        .filter(([key, value]) => value.alt.includes(this.searchSmile))
        .slice(0, 30)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as  Record<string, Smile>);
  }

  setTabName(tabName: string) {
    this.skinVariations = {};
    this.activeTab = tabName;
  }

  addSmileyClick(code: string) {
    this.searchSmile = '';
    this.skinVariations = {}
    let b = allSmileysKeys[code];
    if (b.skinVariations) {
      this.skinVariations = b.skinVariations;
      return
    }
    this.addSmiley(code);
  }

  @Emit()
  addSmiley(code: string) {
    return code
  }

  @Emit()
  close() {
    this.skinVariations = {};
  }

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
    input[type=search]
      width: 100px

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
