<template>
  <div class="container">
    <div ref="div" />
  </div>
</template>
<script lang="ts">
import {
  Component,
  Ref,
  Vue
} from 'vue-property-decorator';


import loggerFactory from '@/ts/instances/loggerFactory';
import AppInputRange from '@/vue/ui/AppInputRange.vue';
import {savedFiles} from '@/ts/utils/htmlApi';

let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}

@Component({name: 'PainterPage'})
 export default class PainterPage extends Vue {

  @Ref()
  public div!: HTMLElement;


  public async mounted() {
    let painterImport = await import(/* webpackChunkName: "spainter" */'spainter');
    let painter = new painterImport.default(this.div, {
      onBlobPaste: (e: Blob) => {
        let id: string = `paintBlob-${getUniqueId()}`;
        savedFiles[id] = e;
        const {roomId, editedMessageId, openedThreadId} = this.$route.query;
        this.$store.setPastingQueue([{
          content: id,
          editedMessageId: parseInt(editedMessageId as string )|| null,
          elType: 'blob',
          openedThreadId: parseInt(openedThreadId as string) || null,
          roomId: parseInt(roomId as string)
        }]);
        this.$router.replace(`/chat/${roomId}`);
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
    this.$emit('canvas', this.div.querySelector('canvas'));
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

</style>
