<template>
  <div class="smileParentHolder">
    <ul class="tabNames">
      <li
        v-for="(_, tabName) in smileys"
        :key="tabName"
        :class="{'activeTab': activeTab === tabName}"
        @click="activeTab = tabName"
      >
        {{ tabName }}
      </li>
    </ul>
    <template v-for="(allSmileys, tabName) in smileys">
      <div
        v-show="activeTab === tabName"
        :key="tabName"
      >
        <img
          v-for="(smiley, code) in allSmileys"
          :key="code"
          :src="smiley.src"
          :alt="smiley.alt"
          :code="code"
          @click="$emit('add-smiley', code)"
        >
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import {smileys} from '@/utils/smileys';
  import {SmileyStructure} from '@/types/types';

  @Component
  export default class SmileyHolder extends Vue {
    smileys = smileys;
    activeTab: string = Object.keys(smileys)[0];

  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

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
