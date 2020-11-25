<template>
  <div class="container">
    <div ref="div" />
  </div>
</template>
<script lang="ts">
import {Component, Ref, Vue} from 'vue-property-decorator';
import Painter from 'spainter';
import {ALL_ROOM_ID} from '@/ts/utils/consts';

import loggerFactory from '@/ts/instances/loggerFactory';
import AppInputRange from '@/vue/ui/AppInputRange.vue';
import {RawLocation, Route} from 'vue-router';
import { savedFiles } from '@/ts/utils/htmlApi';

let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}

@Component
export default class PainterPage extends Vue {

  @Ref()
  public div!: HTMLElement;

  public prevPage: string|null = null;

  public painter!: Painter;

  public beforeRouteEnter(to: Route, frm: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) {
    next(vm => {
      if (/^\/chat\/\d+$/.exec(frm.path)) {
        // @ts-ignore: next-line
        vm.prevPage = frm.path;
      } else {
        // @ts-ignore: next-line
        vm.prevPage = `/chat/${ALL_ROOM_ID}`;
      }
      // @ts-ignore: next-line
      vm.$logger.debug('Painter prev is set to {}, we came from {}', vm.prevPage, frm.path)();
      next();
    });
  }

  public mounted() {
    this.painter = new Painter(this.div, {
      onBlobPaste: (e: Blob) => {
        let id: string = `paintBlob-${getUniqueId()}`;
        savedFiles[id] = e;
        this.$store.setPastingQueue([id]);
        this.$router.replace(this.prevPage!);
      },
      textClass: 'input',
      buttonClass: 'lor-btn',
      logger: loggerFactory.getLogger('painter'),
      rangeFactory: (): HTMLInputElement => {
        let ComponentClass = Vue.extend(AppInputRange);
        let instance = new ComponentClass();
        instance.$mount();

        return instance.$el as HTMLInputElement;
      }
    });
  }
}
</script>
<style lang="sass">
  @import "~spainter/no-fonts.sass"
</style>
<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .container
    height: calc(100% - 55px)
    padding: 10px
    box-sizing: border-box

  .container /deep/
    .active-icon
      color: red


  @media screen and (max-height: 600px)
    .container /deep/ .painterTools
      width: 80px !important
      flex-direction: row !important
      flex-wrap: wrap

</style>
