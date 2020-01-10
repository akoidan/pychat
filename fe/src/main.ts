import "@/utils/classComponentHooks";
import "@/assets/sass/common.sass";
import {
  api,
  channelsHandler,
  globalLogger,
  storage,
  webrtcApi,
  ws,
  xhr,
} from "@/utils/singletons";
import router from "@/utils/router";
import loggerFactory from "@/utils/loggerFactory";
import * as constants from "@/utils/consts";
import {GIT_HASH, IS_DEBUG} from "@/utils/consts";
import {initStore} from "@/utils/utils";
import App from "@/components/App.vue"; // Should be after initStore
import {sub} from "@/utils/sub";
import Vue, {ComponentOptions} from "vue";
import {Logger} from "lines-logger";
import {VueConstructor} from "vue/types/vue";

declare module "vue/types/vue" {

  interface Vue {
    __logger: Logger;
    id?: number|string;
  }
}

const mixin = {
  computed: {
    logger(this: Vue): Logger {
      if (!this.__logger && this.$options._componentTag !== "router-link") {
        let name = this.$options._componentTag ?? "vue-comp";
        if (!this.$options._componentTag) {
          globalLogger.warn("Can't detect tag of {}", this)();
        }
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, "#35495e");
      }

      return this.__logger;
    },
  },
  updated(this: Vue): void {
    this.logger && this.logger.trace("Updated")();
  },
  created(this: Vue) {
    this.logger && this.logger.trace("Created")();
  },
};
Vue.mixin(<ComponentOptions<Vue>><unknown>mixin);

Vue.directive("validity", (el: HTMLElement, binding) => {
  (<HTMLInputElement>el).setCustomValidity(binding.value);
});

Vue.prototype.$api = api;
Vue.prototype.$ws = ws;

initStore().then((value) => {
  globalLogger.debug("Exiting from initing store")();
}).
  catch((e) => {
    globalLogger.error("Unable to init store from db, because of", e)();
  });

const assignConstants = function assignConstants(vue: Vue) {
  window.GIT_VERSION = GIT_HASH;
  if (IS_DEBUG) {
    window.vue = vue;
    window.channelsHandler = channelsHandler;
    window.ws = ws;
    window.api = api;
    window.xhr = xhr;
    window.storage = storage;
    window.webrtcApi = webrtcApi;
    window.sub = sub;
    window.consts = constants;
    globalLogger.log('Constants {}', constants)();
  }
};

export function init() {
  document.body.addEventListener("drop", (ev: DragEvent) => ev.preventDefault());
  document.body.addEventListener("dragover", (ev: DragEvent) => ev.preventDefault());
  const vue: Vue = new Vue({
    render: (cr: Function): typeof Vue.prototype.$createElement => cr(App),
    router,
  });
  vue.$mount("#app");
  assignConstants(vue);
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
