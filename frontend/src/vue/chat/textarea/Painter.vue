<template>
  <div ref="div"/>
</template>

<script lang="ts">
import {
  Component,
  Ref,
  Vue,
} from "vue-property-decorator";

import loggerFactory from "@/ts/instances/loggerFactory";
import AppInputRange from "@/vue/ui/AppInputRange.vue";
import {createApp} from "vue";


@Component({name: "Painter"})
export default class Painter extends Vue {
  @Ref()
  public div!: HTMLElement;

  public async mounted() {
    const painterImport = await import("spainter");
    new painterImport.default(this.div, {
      textClass: "input",
      buttonClass: "lor-btn",
      logger: loggerFactory.getLogger("painter"),
      rangeFactory: (): HTMLInputElement => {
        const app = createApp(AppInputRange);
        const div = document.createElement("div");
        const instance: AppInputRange = app.mount(div) as any;
        div.removeChild(instance.$el);
        setTimeout(() => instance.fixStyle());
        return instance.$el;
      },
      onBlobPaste: (e: Blob) => {
        this.$emit("blob", e);
      },
    });
    this.$emit("canvas", this.div.querySelector("canvas"));
  }
}
</script>
