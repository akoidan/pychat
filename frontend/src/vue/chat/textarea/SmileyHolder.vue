<template>
  <div
    v-if="smileysLoaded"
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
          class="input"
          placeholder="search smile"
          type="search"
        />
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
        :alt="smiley.alt"
        :code="code"
        :src="smiley.src"
        class="emoji"
        @click="addSmileyClick(code)"
      />
    </div>
    <template v-for="(allSmileys, tabName) in smileys" :key="tabName">
      <div v-show="activeTab === tabName && !showFilterSmiley">
        <img
          v-for="(smiley, code) in allSmileys"
          :key="code"
          :alt="smiley.alt"
          :code="code"
          :src="smiley.src"
          class="emoji"
          @click="addSmileyClick(code)"
        />
      </div>
    </template>
  </div>
  <div v-else/>
</template>
<script lang="ts">
import {Component, Emit, Vue, Watch,} from "vue-property-decorator";
import type {Smile, SmileVariation, SmileysStructure,} from "@/ts/utils/smileys";

@Component({name: "SmileyHolder"})
export default class SmileyHolder extends Vue {
  // Object.keys(smileys)[0];
  public activeTab: string = "Smileys";

  public skinVariations: Record<string, SmileVariation> = {};

  public searchResults: Record<string, SmileVariation> = {};

  public recentSmileysCodes: string[] = [];

  public searchSmile: string = "";

  // This can't be state, since we need to set local properties before
  public smileysLoaded: boolean = false;

  public smileysData: SmileysStructure | null = null;

  public allSmileysKeys: Record<string, Smile> | null = null;

  public allSmileysKeysNoVariations: Record<string, SmileVariation> | null = null;

  public get smileys() {
    if (this.recentSmileysCodes.length > 0) {
      return {
        Recent: this.recentSmileys,
        ...this.smileysData,
      };
    }
    return this.smileysData;
  }

  public get filterSmiley() {
    if (Object.keys(this.skinVariations).length > 0) {
      return this.skinVariations;
    }
    if (Object.keys(this.searchResults).length > 0) {
      return this.searchResults;
    }
    return {};
  }

  public get recentSmileys(): Record<string, SmileVariation> {
    return this.recentSmileysCodes.slice(0, 15).reduce<Record<string, Smile>>((obj, key) => {
      obj[key] = this.allSmileysKeys![key];
      return obj;
    }, {});
  }

  public get showFilterSmiley() {
    return Object.keys(this.skinVariations).length > 0 || Object.keys(this.searchResults).length > 0 || this.searchSmile;
  }

  async mounted() {
    this.recentSmileysCodes = JSON.parse(localStorage.getItem("recentSmileys") || "[]");
    const {smileys, allSmileysKeys, allSmileysKeysNoVariations} = await this.$smileyApi.allData();
    this.smileysData = smileys;
    this.allSmileysKeys = allSmileysKeys;
    this.allSmileysKeysNoVariations = allSmileysKeysNoVariations;
    this.smileysLoaded = true;
  }

  @Watch("searchSmile")
  searchSmileChange() {
    if (!this.searchSmile) {
      this.searchResults = {};
      return;
    }
    this.searchResults = Object.entries(this.allSmileysKeysNoVariations!).
      filter(([key, value]) => value.alt.includes(this.searchSmile)).
      slice(0, 30).
      reduce<Record<string, Smile>>((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }

  mouseDownMain(e: MouseEvent) {
    if ((e.target as HTMLElement)?.tagName !== "INPUT") {
      e.preventDefault();
    }
  }

  setTabName(tabName: string) {
    this.skinVariations = {};
    this.activeTab = tabName;
  }

  addSmileyClick(code: string) {
    this.searchSmile = "";
    this.skinVariations = {};
    const b = this.allSmileysKeys![code];
    if (b.skinVariations) {
      this.skinVariations = b.skinVariations;
      return;
    }
    this.recentSmileysCodes = JSON.parse(localStorage.getItem("recentSmileys") || "[]");
    if (this.recentSmileysCodes.includes(code)) {
      this.recentSmileysCodes.splice(this.recentSmileysCodes.indexOf(code), 1);
    }
    this.recentSmileysCodes.unshift(code);
    localStorage.setItem("recentSmileys", JSON.stringify(this.recentSmileysCodes));
    this.addSmiley(code);
  }

  @Emit()
  addSmiley(code: string) {
    return code;
  }

  @Emit()
  close() {
    this.skinVariations = {};
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"
@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"

.emoji
  width: $emoji-width
  cursor: pointer

.icon-cancel-circled-outline
  position: relative
  // icon is broken a bit, it occupies 1 px above the screen
  top: 1px
  right: -10px
  // ignore padding right
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
