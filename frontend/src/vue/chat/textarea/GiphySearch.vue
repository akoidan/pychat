<template>
  <div class="giphy-search">
    <!--  50 is giphy max length api  /-->
    <div class="giphy-header">
      <input
        v-model="search"
        class="input"
        maxlength="50"
        type="search"
      />
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
      <div v-if="images.length === 0 && search && !abortFn">
        Nothing found
      </div>
      <app-loading-image
        v-for="gif in images"
        :key="gif.id"
        :src="getImageSrc(gif)"
        class="img-wrapper"
        @click.native="addGihpy(gif)"
      />
      <input
        v-if="showLoadMoreBtn"
        :value="`Load ${pagination.total_count - pagination.offset} more`"
        class="lor-btn"
        type="button"
        @click="fetchGiphies"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Emit, Ref, Vue, Watch} from "vue-property-decorator";
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import AppSuspense from "@/vue/ui/AppSuspense.vue";
import {webpSupported} from "@/ts/utils/runtimeConsts";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type {GIFObject, MultiResponse} from "giphy-api";
import AppLoadingImage from "@/vue/ui/AppLoadingImage.vue";
import {LOAD_GIPHIES_PER_REQUEST} from "@/ts/utils/consts";

@Component({
  name: "GiphySearch",
  components: {
    AppLoadingImage,
    AppSuspense,
    AppSubmit,
  },
})
export default class GiphySearch extends Vue {
  public search: string = "";

  public pagination: MultiResponse["pagination"] = {
    count: 0,
    offset: 0,
    total_count: 0,
  };

  public moreLoading: boolean = false;

  public images: GIFObject[] = [];

  public abortFn: (() => void) | null = null;

  @Ref()
  private readonly suspense!: AppSuspense;

  @Ref()
  private readonly giphyContent!: HTMLDivElement;

  private webpSupported: boolean = webpSupported;

  public get showLoadMoreBtn() {
    return !this.abortFn && this.images.length > 0 && this.pagination.count === LOAD_GIPHIES_PER_REQUEST;
  }

  async mounted() {
    await this.onSearchChange();
  }

  getImageSrc(gif: GIFObject) {
    if (gif.images.fixed_height_small) {
      return webpSupported && gif.images.fixed_height_small.webp ? gif.images.fixed_height_small.webp : gif.images.fixed_height_small.url;
    }
    if (gif.images.fixed_height) {
      return webpSupported && gif.images.fixed_height.webp ? gif.images.fixed_height.webp : gif.images.fixed_height.url;
    }
    throw Error(`Invalid image ${JSON.stringify(gif)}`);
  }

  @Emit()
  addGihpy(img: GIFObject) {
    return img;
  }

  @Watch("search")
  @ApplyGrowlErr({
    message: "Unable to load more giphies",
    runningProp: "moreLoading",
  })
  async onSearchChange() {
    if (this.abortFn) {
      this.abortFn();
      this.abortFn = null;
    }
    const response = await this.$api.giphyApi.searchGiphys(this.search, 0, LOAD_GIPHIES_PER_REQUEST, (r) => this.abortFn = r);
    this.pagination = response.pagination;
    this.abortFn = null;
    this.images = response.data;
  }

  async loadMore() {
    const {scrollHeight, scrollTop, clientHeight} = this.giphyContent;
    if (scrollHeight - scrollTop < clientHeight + 100) {
      await this.fetchGiphies();
    }
  }

  @ApplyGrowlErr({
    message: "Unable to load more giphies",
    runningProp: "moreLoading",
    preventStacking: true,
  })
  async fetchGiphies() {

    /*
     * W/0 +1, it returns duplicate id
     * the weird thing docs say, that pagination start with 0, but it seems like with 1
     */
    const response: MultiResponse = await this.$api.giphyApi.searchGiphys(this.search, this.images.length + 1, LOAD_GIPHIES_PER_REQUEST, (r) => this.abortFn = r);
    this.pagination = response.pagination;
    this.images.push(...response.data.filter((n) => !this.images.find((o) => o.id === n.id)));
  }

  @Emit()
  close() {
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

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
  display: flex
  flex-direction: row
  flex-wrap: wrap

  .img-wrapper
    padding: 5px
    margin: auto
    cursor: pointer

    :deep(img)
      max-width: 100%
// some images can be fixed hight but really wide, search 'fsg' for e.g
</style>
