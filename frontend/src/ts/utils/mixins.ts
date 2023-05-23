import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {VueBase} from "vue-class-component";
import type {ComponentOptions} from "vue";

export const loggerMixin = {
  computed: {
    $logger(this: ComponentOptions): Logger {
      if (!this.__logger && this.$options._componentTag !== "router-link") {
        let {name} = this.$options;
        if (["RouterView", "RouterLink"].includes(name)) {
          return null as any;
        }
        const fileName = this.$options.__file;
        if (!name && fileName) {
          name = fileName.substr(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".") - fileName.lastIndexOf("/") - 1);
        }
        if (!name) {
          name = "vue-comp";
        }
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, "#35495e");
      }
      return this.__logger;
    },
  },
  updated(this: VueBase): void {
    this.$logger && !this.$noVerbose && this.$logger.debug("Updated")();
  },
  unmounted(this: VueBase) {
    this.$logger && this.$logger.debug("unmounted")();
  },
  created(this: VueBase) {
    this.$logger && this.$logger.debug("Created")();
  },
};

