<template>
  <div class="search" v-show="room.search.searchActive" :class="{'loading': !!currentRequest}">
    <input type="search" class="input" v-model.trim="search"/>
    <div class="search-loading"></div>
    <div class="search_result" v-if="searchResultText">{{searchResultText}}</div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {debounce} from 'lodash';
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {RoomModel, SearchModel} from "../../types/model";
  import {MessageModelDto} from "../../types/dto";
  import {channelsHandler} from "../../utils/singletons";
  import {SetSearchTo} from "../../types/types";
  import {MESSAGES_PER_SEARCH} from '../../utils/consts';


  const START_TYPING = 'Start typing and messages will appear';

  @Component
  export default class SearchMessages extends Vue {

    @Prop() room: RoomModel;
    @Mutation setSearchTo;

    debouncedSearch: Function;
    search: string = '';
    offset: number = 0;
    currentRequest: XMLHttpRequest = null;
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


    created() {
      this.search = this.room.search.searchText;
      if (!this.search) {
        this.searchResult = START_TYPING;
      }
      this.debouncedSearch = debounce(this.doSearch, 500);
    }

    private mutateSearchedIds(searchedIds: number[], searchText: string) {
      let search: SearchModel = {
        searchActive: this.room.search.searchActive,
        searchedIds,
        searchText,
        locked: searchedIds.length < MESSAGES_PER_SEARCH
      };
      this.setSearchTo({
        roomId: this.room.id,
        search
      } as SetSearchTo);
    }

    doSearch(search: string) {
      if (search) {
        this.currentRequest = this.$api.search(search, this.room.id, this.offset, (a: MessageModelDto[], e: string) => {
          this.logger.debug("http response {} {}", a, e)();
          this.currentRequest = null;
          if (e) {
            this.searchResult = e;
            this.mutateSearchedIds([], search);
          } else if (a.length) {
            channelsHandler.addMessages(this.room.id, a);
            let ids = this.room.search.searchedIds.concat([]);
            this.mutateSearchedIds(a.map(a => a.id), search);
            this.searchResult = null;
          } else {
            this.mutateSearchedIds([], search);
            this.searchResult = 'No results found';
          }
        });
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
  @import "partials/mixins"
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