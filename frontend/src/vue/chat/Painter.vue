<template>
  <div ref="div" />
</template>

<script lang="ts">
import {
  Component,
  Ref,
  Vue
} from 'vue-property-decorator';
import Painter from 'spainter';

import loggerFactory from '@/ts/instances/loggerFactory';
import AppInputRange from '@/vue/ui/AppInputRange.vue';


let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}


@Component
export default class PainterPage extends Vue {

  @Ref()
  public div!: HTMLElement;

  public painter!: Painter;

  public mounted() {
    this.painter = new Painter(this.div, {
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
    this.$emit('canvas', this.div.querySelector('canvas'));
  }
}
</script>
<style lang="sass">
  @import "~spainter/no-fonts.sass"
</style>
