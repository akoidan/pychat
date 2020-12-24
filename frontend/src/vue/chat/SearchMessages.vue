<template>
  <div
    v-show="searchActive"
    class="search"
    :class="{'loading': !!currentRequest}"
  >
    <div class="input-holder">
      <input
        ref="inputSearch"
        v-model.trim="search"
        type="search"
        class="input"
      >
      <i class="icon-cancel-circled-outline" @click="close"/>
      <div class="search-loading" />
    </div>
    <div
      v-if="searchResultText"
      class="search_result"
    >
      {{ searchResultText }}
    </div>
  </div>
</template>
<script lang="ts">
import debounce from 'lodash.debounce';
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch
} from 'vue-property-decorator';
import {
  RoomModel,
  SearchModel
} from '@/ts/types/model';
import { MessageModelDto } from '@/ts/types/dto';
import { MESSAGES_PER_SEARCH } from '@/ts/utils/consts';

const START_TYPING = 'Start typing and messages will appear';

@Component
export default class SearchMessages extends Vue {

  get searchResultText() {
    if (this.searchResult) {
      return this.searchResult;
    } else if (!this.room.search.locked) {
      return 'More messages are available, scroll top to load them';
    } else {
      return 'No more messages are available on this search';
    }
  }

  close() {
    this.$store.toogleSearch({
      roomId: this.room.id
    });
  }

  get searchActive() {
    return this.room.search.searchActive;
  }

  @Prop() public room!: RoomModel;

  @Ref()
  public inputSearch!: HTMLInputElement;

  public debouncedSearch!: Function;
  public search: string = '';
  public currentRequest: XMLHttpRequest|null = null;
  public searchResult: string = '';

  @Watch('searchActive')
  public onSearchActiveChange(value: boolean) {
    if (value) {
      this.$nextTick(function () {
        this.inputSearch.focus();
      });
    }
  }

  public created() {
    this.search = this.room.search.searchText;
    if (!this.search) {
      this.searchResult = START_TYPING;
    }
    this.debouncedSearch = debounce(this.doSearch, 500);
  }

  public async doSearch(search: string) {
    if (search) {
      try {
        let found = await this.$messageSenderProxy
            .getMessageSender(this.room.id)
            .loadUpSearchMessages(this.room.id, 10, r => {
              this.currentRequest = r
            });
        this.currentRequest = null;
        if (found) {
          this.searchResult = '';
        } else {
          this.searchResult = 'No results found';
        }
      } catch (e) {
        this.searchResult = e;
      }
    } else {
      this.searchResult = START_TYPING;
    }
  }

  @Watch('search')
  public onSearchChange(search: string) {
    this.$store.setSearchTextTo({searchText: search, roomId: this.room.id})
    if (this.currentRequest) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
    this.debouncedSearch(search);
  }
}
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/mixins"

  .icon-cancel-circled-outline
    @include hover-click(red)
    cursor: pointer
  .input-holder
    display: flex
    width: 100%
    .input
      flex-grow: 1
  .search
    padding: 5px
    &.loading
      .search-loading
        margin-left: 5px
        margin-bottom: -5px
        margin-top: -3px
        @include spinner(3px, white)

  .search_result
    display: flex
    justify-content: center
    padding-top: 10px
</style>
