<template>
  <div class="giphy-search">
    <!--  50 is giphy max length api  /-->
    <div class="giphy-header">
      <input
        v-model="search"
        type="search"
        class="input"
        maxlength="50"
      >
      <i
        class="icon-cancel-circled-outline"
        title="Close"
        @click="close"
      />
    </div>

    <div
      ref="giphyContent"
      class="giphy-content"
      @scroll.passive="loadMore"
    >
      <div v-if="images.length === 0 && search && !request">
        Nothing found
      </div>
      <app-loading-image
        v-for="gif in images"
        :key="gif.id"
        @click.native="addGihpy(gif)"
        class="img-wrapper"
        :src="webpSupported ? gif.images.fixed_height_small.webp: gif.images.fixed_height_small.url"
      />
      <input type="button" class="lor-btn" v-if="!request" value="Load more" @click="fetchGiphies"/>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Watch,
  Ref,
  Emit
} from "vue-property-decorator";
import { ApplyGrowlErr } from '@/ts/instances/storeInstance';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import AppSuspense from '@/vue/ui/AppSuspense.vue';
import {webpSupported} from '@/ts/utils/runtimeConsts';
import {
  GIFObject,
  MultiResponse
} from 'giphy-api';
import AppLoadingImage from '@/vue/ui/AppLoadingImage.vue';
@Component({
  components: {AppLoadingImage, AppSuspense, AppSubmit}
})
export default class GiphySearch extends Vue {

  @Ref()
  private readonly suspense!: AppSuspense;

  @Ref()
  private readonly giphyContent!: HTMLDivElement;

  private search: string = '';
  private webpSupported: boolean = webpSupported;
  public moreLoading: boolean = false;
  private images: GIFObject[] = [];

  private request: XMLHttpRequest|null = null;

  async mounted() {
    await this.onSearchChange();
  }

  @Emit()
  addGihpy(img: GIFObject) {
    return img;
  }

  @Watch('search')
  @ApplyGrowlErr({message: "Unable to load more giphies", runningProp: 'moreLoading'})
  async onSearchChange() {
    if (this.request) {
      this.request.abort();
      this.request = null;
    }
    const response = await this.$api.searchGiphys(this.search, 0, r => this.request = r);
    this.request = null;
    this.images = response.data;
  }

  async loadMore() {
    const {scrollHeight, scrollTop, clientHeight } =  this.giphyContent;
    if (scrollHeight - scrollTop  < clientHeight + 100) {
      await this.fetchGiphies();
    }
  }

  @ApplyGrowlErr({message: "Unable to load more giphies", runningProp: 'moreLoading', preventStacking: true})
  async fetchGiphies() {
    // w/0 +1, it returns duplicate id
    // the weird thing docs say, that pagination start with 0, but it seems like with 1
    let response: MultiResponse = await this.$api.searchGiphys(this.search, this.images.length + 1, r => this.request = r);
    console.warn({old: this.images, new: response})
    this.images.push(...response.data.filter(n => !this.images.find(o => o.id === n.id)));
  }

  @Emit()
  close() {}
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .giphy-header
    display: flex
    padding-bottom: 15px
    input
      flex: 1
      margin-right: 10px
    i
      @include hover-click(red)
  .giphy-search
    padding: 5px
    @extend %modal-window

  input[type=button]
    width: 100%
  .giphy-content
    overflow: scroll
    max-height: 800px
    height: calc(100vh - 300px)
    min-height: 100px
    .img-wrapper
      padding: 5px
      display: inline-block
      max-height: 100%
      width: calc(50% - 10px)
      cursor: pointer
      // if right bar is hidden
      @media screen and (max-width: $collapse-width /2)
        width: calc(100% - 10px)
      @media screen and (min-width: $collapse-width / 2) and (max-width: $collapse-width)
        width: calc(50% - 10px)
      // if right bar is present
      @media screen and (min-width: $collapse-width) and (max-width: $collapse-width * 3 / 2)
        width: calc(50% - 10px)
      @media screen and (min-width: $collapse-width * 3 / 2) and (max-width: $collapse-width * 2)
        width: calc(33% - 10px)
      @media screen and (min-width: $collapse-width * 2) and (max-width: $collapse-width * 4)
        width: calc(25% - 10px)
      @media screen and (min-width: $collapse-width * 4)
          width: auto
      /deep/ img
        max-width: 100%
        max-height: 100%
</style>
