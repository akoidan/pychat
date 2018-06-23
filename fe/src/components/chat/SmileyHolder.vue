<template>
  <div class="smileParentHolder">
    <ul class="tabNames">
      <li
          v-for="(_, tabName) in smileys"
          :key="tabName"
          :class="{'activeTab': activeTab === tabName}"
          @click="activeTab = tabName">{{tabName}}
      </li>
    </ul>
    <template v-for="(allSmileys, tabName) in smileys">
      <div
          :key="tabName"
          v-show="activeTab === tabName">
        <img
            @click="$emit('add-smiley', code)"
            v-for="(smiley, code) in allSmileys"
            :src="buildUrl(smiley, tabName)"
            :alt="smiley.alt"
            :code="code"
            :key="code">
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import smileys from "../../assets/smileys/info.json";
  import {SmileyStructure} from '../../types';
  import {getSmileyPath} from '../../utils/htmlApi';

  @Component
  export default class SmileyHolder extends Vue {
    smileys: {[id: string]: {[id: string]: SmileyStructure[]}} = smileys;
    activeTab: string = Object.keys(smileys)[0];

    created() {
      this.logger.log("Smiley inited {}", this.smileys)();
    }

    buildUrl(smiley: SmileyStructure, tabName: string) {
      return getSmileyPath(smiley);
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"

  .tabNames
    margin: 0
    padding-left: 0

    > li
      display: inline
      padding-left: 10px
      padding-right: 10px

      &:hover
        cursor: pointer
        text-decoration: underline

  .smileParentHolder
    position: absolute
    right: 5px
    padding: 10px
    bottom: 0
    border-radius: 10px
    width: 50%

    @media screen and (max-height: 300px), screen and (max-width: 600px)
      width: calc(100% - 30px)

    img
      cursor: pointer

  .color-lor
    .smileParentHolder
      @extend %window-lor
    .activeTab
      color: #fcaf3e

  .color-reg
    .smileParentHolder
      @extend %window-reg
    .activeTab
      color: #C6B955

  .color-white
    .smileParentHolder
      @extend %window-white
    .activeTab
      color: #11970d
</style>