<template>
  <div
    v-show="searchActive"
    class="search"
    :class="{'loading': !!currentRequest}"
  >
    <input
      ref="inputSearch"
      v-model.trim="search"
      type="search"
      class="input"
    >
    <div class="search-loading" />
    <div
      v-if="searchResultText"
      class="search_result"
    >
      {{ searchResultText }}
    </div>
  </div>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import debounce from 'lodash.debounce';
  import {Component, Prop, Vue, Watch, Ref} from "vue-property-decorator";
  import {RoomModel, SearchModel} from "@/types/model";
  import {MessageModelDto} from "@/types/dto";
  import {channelsHandler} from "@/utils/singletons";
  import {SetSearchTo} from "@/types/types";
  import {MESSAGES_PER_SEARCH} from '@/utils/consts';


  const START_TYPING = 'Start typing and messages will appear';

  @Component
  export default class SearchMessages extends Vue {

    @Prop() room!: RoomModel;

    @Ref()
    inputSearch!: HTMLInputElement;

    debouncedSearch!: Function;
    search: string = '';
    offset: number = 0;
    currentRequest: XMLHttpRequest|null = null;
    searchResult: string = '';
    searchedIds = [];

    get searchResultText() {
      if (this.searchResult) {
        return this.searchResult;
      } else if (!this.room.search.locked) {
        return 'More messages are available, scroll top to load them';
      } else {
        return '';
      }
    }

    get searchActive() {
      return this.room.search.searchActive;
    }

    @Watch('searchActive')
    onSearchActiveChange(value: boolean) {
      if (value) {
        this.$nextTick(function () {
          this.inputSearch.focus();
        })
      }
    }

    created() {
      this.search = this.room.search.searchText;
      if (!this.search) {
        this.searchResult = START_TYPING;
      }
      this.debouncedSearch = debounce(this.doSearch, 500);
    }

    private mutateSearchedIds(searchedIds: number[], searchText: string) {
      let search: SearchModel = {
        searchActive: this.searchActive,
        searchedIds,
        searchText,
        locked: searchedIds.length < MESSAGES_PER_SEARCH
      };
      this.store.setSearchTo({
        roomId: this.room.id,
        search
      } as SetSearchTo);
    }

    async doSearch(search: string) {
      if (search) {
        try {
         let a: MessageModelDto[] = await  this.$api.search(search, this.room.id, this.offset, r => this.currentRequest = r);
         this.logger.debug("http response {} {}", a)();
         this.currentRequest = null;
          if (a.length) {
            channelsHandler.addMessages(this.room.id, a);
            let ids = this.room.search.searchedIds.concat([]);
            this.mutateSearchedIds(a.map(a => a.id), search);
            this.searchResult = '';
          } else {
            this.mutateSearchedIds([], search);
            this.searchResult = 'No results found';
          }
        } catch (e) {
          this.searchResult = e;
          this.mutateSearchedIds([], search);
        }
      } else {
        this.mutateSearchedIds([], search);
        this.searchResult = START_TYPING;
      }
    }

    @Watch("search")
    onSearchChange(search: string) {
      if (this.currentRequest) {
        this.currentRequest.abort();
        this.currentRequest = null;
      }
      this.debouncedSearch(search)
    }
  }
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins"
  .search
    padding: 5px
    > *
      display: inline-block
    input
      width: calc(100% - 10px)
    &.loading
      .search-loading
        margin-left: 5px
        margin-bottom: -5px
        margin-top: -3px
        @include spinner(3px, white)
      input
        width: calc(100% - 40px)

  .search_result
    display: flex
    justify-content: center
    padding-top: 10px
</style>
