<template>
  <div class="container">
    <painter @blob="onBlobPaste"/>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Ref,
  Vue,
} from "vue-property-decorator";
import Painter from "@/vue/chat/textarea/Painter.vue";


import {savedFiles} from "@/ts/utils/htmlApi";

let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}

@Component({
  name: "PainterPage",
  components: {Painter},
})
export default class PainterPage extends Vue {
  @Ref()
  public div!: HTMLElement;

  public onBlobPaste(e: Blob) {
    const id: string = `paintBlob-${getUniqueId()}`;
    savedFiles[id] = e;
    const {roomId, editedMessageId, openedThreadId} = this.$route.query;
    this.$store.setPastingQueue([
      {
        content: id,
        editedMessageId: parseInt(editedMessageId as string) || null,
        elType: "blob",
        openedThreadId: parseInt(openedThreadId as string) || null,
        roomId: parseInt(roomId as string),
      },
    ]);
    this.$router.replace(`/chat/${roomId}`);
  }
}
</script>
<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

.container
  height: calc(100% - 55px)
  padding: 10px
  box-sizing: border-box

.container :deep(.active-icon)
  color: red

</style>
