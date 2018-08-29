<template>
  <div class="container">
    <div ref="div"></div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import Painter from 'spainter';
  import {messageBus} from '../../utils/singletons';
  import loggerFactory from "../../utils/loggerFactory";
  import AppInputRange from '../ui/AppInputRange';
  @Component
  export default class PainterPage extends Vue {
    $refs: {
      div: HTMLElement
    };

    prevPage: string = null;
    blob: Blob = null;

    painter: Painter;

    beforeRouteEnter(to, frm, next) {
      next(vm => {
        if (/^\/chat\/\d+$/.exec(frm.path)) {
          vm.prevPage = frm.path;
        } else {
          vm.prevPage = "/chat/1";
        }
        vm.logger.debug("Painter prev is set to {}, we came from {}", vm.prevPage, frm.path)();
        next();
      });
    }

    created() {
      messageBus.$on('main-join', e => {
        if (this.blob) {
          messageBus.$emit('blob', this.blob);
          this.blob = null;
        }
      })
    }


    mounted() {
      this.painter = new Painter(this.$refs.div, {
        onBlobPaste: (e: Blob) => {
          this.blob = e;
          this.$router.replace(this.prevPage);
        },
        textClass: 'input',
        buttonClass: 'lor-btn',
        logger: loggerFactory.getLoggerColor('painter', '#d507bd'),
        rangeFactory: (): HTMLInputElement => {
          var ComponentClass = Vue.extend(AppInputRange);
          var instance = new ComponentClass();
          instance.$mount();
          return instance.$el as HTMLInputElement;
        }
      });
    }
  }
</script>

<style lang="sass" scoped>

  @import "partials/abstract_classes"

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