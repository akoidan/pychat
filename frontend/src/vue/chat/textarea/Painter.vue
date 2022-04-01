<template>
  <div ref="div" />
</template>

<script lang="ts">
import {
  Component,
  Ref,
  Vue
} from 'vue-property-decorator';

import loggerFactory from '@/ts/instances/loggerFactory';
import AppInputRange from '@/vue/ui/AppInputRange.vue';
import { createApp } from 'vue';


let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}


@Component({name: 'Painter'})
 export default class Painter extends Vue {

  @Ref()
  public div!: HTMLElement;

  public async mounted() {
    let painterImport = await import(/* webpackChunkName: "spainter" */ 'spainter');
    new painterImport.default(this.div, {
      textClass: 'input',
      buttonClass: 'lor-btn',
      logger: loggerFactory.getLogger('painter'),
      rangeFactory: (): HTMLInputElement => {
        // TODO vue3 vue.extend does it work
        let app = createApp(AppInputRange);
        let div = document.createElement('div');
        return  app.mount(div).$el;
      }
    });
    this.$emit('canvas', this.div.querySelector('canvas'));
  }
}
</script>
