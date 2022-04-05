<template>
  <div
    v-show="searchActive"
    :class="{'loading': !!currentRequest}"
    class="search"
  >
    <div class="input-holder">
      <input
        ref="inputSearch"
        v-model.trim="search"
        class="input"
        type="search"
        @keydown="checkToggleSearch"
      />
      <i class="icon-cancel-circled-outline" @click="close"/>
      <div class="search-loading"/>
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
import debounce from "lodash.debounce";
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {RoomModel} from "@/ts/types/model";

const START_TYPING = "Start typing and messages will appear";


let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}

@Component({name: "SearchMessages"})
export default class SearchMessages extends Vue {
  @Prop() public room!: RoomModel;

  @Ref()
  public inputSearch!: HTMLInputElement;

  public debouncedSearch!: Function;

  public search: string = "";

  public currentRequest: number = 0;

  public searchResult: string = "";

  get searchResultText() {
    if (this.searchResult) {
      return this.searchResult;
    } else if (!this.room.search.locked) {
      return "More messages are available, scroll top to load them";
    }
    return "No more messages are available on this search";
  }

  get searchActive() {
    return this.room.search.searchActive;
  }

  close() {
    this.$store.toogleSearch(this.room.id);
  }

  @Watch("searchActive")
  public onSearchActiveChange(value: boolean) {
    if (value) {
      this.$nextTick(function() {
        this.inputSearch.focus();
      });
    }
  }

  public checkToggleSearch(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.$store.toogleSearch(this.room.id);
    }
  }

  public created() {
    this.search = this.room.search.searchText;
    if (!this.search) {
      this.searchResult = START_TYPING;
    }
    this.debouncedSearch = debounce(this.doSearch, 500);
  }

  private async doSearch(search: string) {
    if (!search) {
      this.searchResult = START_TYPING;
      return;
    }

    const uniqueId = getUniqueId();
    try {
      this.currentRequest = uniqueId;
      await this.$messageSenderProxy.getMessageSender(this.room.id).loadUpSearchMessages(
        this.room.id,
        10,
        (found) => {
          if (found) {
            this.searchResult = "";
          } else {
            this.searchResult = "No results found";
          }
          if (this.currentRequest === uniqueId) {
            this.currentRequest = 0;
            return true;
          }
          return false;
        },
      );
    } catch (e: any) {
      if (uniqueId === this.currentRequest) {
        this.currentRequest = 0;
      }
      this.searchResult = e;
    }
  }

  @Watch("search")
  private onSearchChange(search: string) {
    this.$store.setSearchTextTo({
      searchText: search,
      roomId: this.room.id,
    });
    if (this.currentRequest) {
      this.currentRequest = getUniqueId();
    }
    this.debouncedSearch(search);
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/sass/partials/mixins"

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
