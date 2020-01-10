<template>
  <div class="container">
    <div ref="div"/>
  </div>
</template>
<script lang="ts">
import {State} from "@/utils/storeHolder";
import {Component, Prop, Ref, Vue} from "vue-property-decorator";
import Painter from "spainter";
import {messageBus} from "@/utils/singletons";
import loggerFactory from "@/utils/loggerFactory";
import AppInputRange from "@/components/ui/AppInputRange.vue";
import {RawLocation, Route} from "vue-router";
@Component
export default class PainterPage extends Vue {
  @Ref()
  public div!: HTMLElement;

  public prevPage: string|null = null;

  public blob: Blob|null = null;

  public painter!: Painter;

  public beforeRouteEnter(to: Route, frm: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) {
    next((vm) => {
      if ((/^\/chat\/\d+$/).exec(frm.path)) {
        // @ts-ignore: next-line
        vm.prevPage = frm.path;
      } else {
        // @ts-ignore: next-line
        vm.prevPage = "/chat/1";
      }
      // @ts-ignore: next-line
      vm.logger.debug("Painter prev is set to {}, we came from {}", vm.prevPage, frm.path)();
      next();
    });
  }

  public created() {
    messageBus.$on("main-join", () => {
      if (this.blob) {
        messageBus.$emit("blob", this.blob);
        this.blob = null;
      }
    });
  }

  public mounted() {
    this.painter = new Painter(this.div, {
      onBlobPaste: (e: Blob) => {
        this.blob = e;
        this.$router.replace(this.prevPage!);
      },
      textClass: "input",
      buttonClass: "lor-btn",
      logger: loggerFactory.getLoggerColor("painter", "#d507bd"),
      rangeFactory: (): HTMLInputElement => {
        const ComponentClass = Vue.extend(AppInputRange);
        const instance = new ComponentClass();
        instance.$mount();

        return instance.$el as HTMLInputElement;
      },
    });
  }
}
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .container
    height: calc(100% - 55px)
    padding: 10px
    box-sizing: border-box

  .container /deep/
    .active-icon
      color: red

    @import "~spainter/no-fonts.sass"
  @media screen and (max-height: 600px)
    .container /deep/ .painterTools
      width: 80px !important
      flex-direction: row !important
      flex-wrap: wrap

</style>
