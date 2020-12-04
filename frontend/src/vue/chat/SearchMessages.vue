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

  get searchActive() {
    return this.room.search.searchActive;
  }

  @Prop() public room!: RoomModel;

  @Ref()
  public inputSearch!: HTMLInputElement;

  public debouncedSearch!: Function;
  public search: string = '';
  public offset: number = 0;
  public currentRequest: XMLHttpRequest|null = null;
  public searchResult: string = '';
  public searchedIds = [];

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
       const messagesDto: MessageModelDto[] = await  this.$api.search(search, this.room.id, this.offset, r => this.currentRequest = r);
       this.$logger.debug('http response {} {}', messagesDto)();
       this.currentRequest = null;
       if (messagesDto.length) {
          this.$messageSenderProxy.getMessageSender(this.room.id).addSearchMessages(this.room.id, messagesDto);
          this.searchResult = '';
        } else {
          this.searchResult = 'No results found';
        }
        this.$store.setSearchStateTo({roomId: this.room.id, lock: messagesDto.length < MESSAGES_PER_SEARCH});
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
