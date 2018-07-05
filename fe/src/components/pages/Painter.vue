<template>
  <div class="container">
    <div ref="div"></div>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation, Getter} from "vuex-class";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import PainterObj from 'spainter';
  import {messageBus} from '../../utils/singletons';

  @Component
  export default class Painter extends Vue {
    $refs: {
      div: HTMLElement
    };

    prevPage: string = null;

    painter;

    beforeRouteEnter (to, frm, next) {
      next(vm => {
        if (/^\/chat\/\d+$/.exec(frm.path)) {
          vm.prevPage = frm.path;
        } else {
          vm.prevPage = '/chat/1';
        }
        vm.logger.debug('Painter prev is set to {}, we came from {}', vm.prevPage, frm.path)();
        next();
      });
    }


    mounted() {
      this.painter = new (<any>PainterObj)(this.$refs.div, e=> {
        this.$router.replace(this.prevPage);
        messageBus.$emit('blob', e);
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

</style>