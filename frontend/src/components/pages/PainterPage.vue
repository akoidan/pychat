<template>
  <div class="container">
    <div ref="div" />
  </div>
</template>
<script lang="ts">
import {State} from '@/utils/storeHolder';
import {Component, Prop, Vue, Ref} from 'vue-property-decorator';
import Painter from 'spainter';
import {ALL_ROOM_ID} from '@/utils/consts';
import {messageBus} from '@/utils/singletons';
import loggerFactory from '@/utils/loggerFactory';
import AppInputRange from '@/components/ui/AppInputRange';
import {Route, RawLocation} from 'vue-router';
@Component
export default class PainterPage extends Vue {

  @Ref()
  public div!: HTMLElement;

  public prevPage: string|null = null;
  public blob: Blob|null = null;

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

  onEmitMainJoin() {
    this.$logger.log("Emitting back {}", this.blob)();
    if (this.blob) {
      messageBus.$emit('blob', this.blob);
      this.blob = null;
    }
  }
  public created() {
    messageBus.$on('main-join', this.onEmitMainJoin);
  }

  destroyed() {
    // 1. this component is destroyed
    // 2. channelsPage is emitting event
    // 3. this component don't listed for event already
    // so since operation above is synchronous, scheduling even to eventloop helps
    // TODO this should be resolved in a better way
    window.setTimeout(() => {
      messageBus.$off('main-join', this.onEmitMainJoin);
    });
  }

  public mounted() {
    this.painter = new Painter(this.div, {
      onBlobPaste: (e: Blob) => {
        this.blob = e;
        this.$router.replace(this.prevPage!);
      },
      textClass: 'input',
      buttonClass: 'lor-btn',
      logger: loggerFactory.getLoggerColor('painter', '#d507bd'),
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
