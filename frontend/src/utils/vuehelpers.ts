import {IS_ANDROID} from '@/utils/consts';
import {globalLogger} from '@/utils/singletons';
import Vue, {ComponentOptions} from 'vue';
import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';
import {VNode} from 'vue/types/vnode'
import {isMobile} from '@/utils/runtimeConsts';
const HOLD_TIMEOUT = 300;


export function declareDirectives() {
  Vue.directive('validity', function (el: HTMLElement, binding) {
    (<HTMLInputElement>el).setCustomValidity(binding.value);
  });

  interface MyVNode extends VNode {
    switcherTimeout?: number;
    switcherStart?: () => Promise<void>;
    switcherFinish?: () => Promise<void>;
  }

  function getEventName(eventType: 'start' | 'end') : string[] {
    if (IS_ANDROID || isMobile) {
      return eventType === 'start' ? ['touchstart'] : ['touchend'];
    } else {
      return eventType === 'start' ? ['mousedown'] : ['mouseleave', 'mouseup'];
    }
  }

  Vue.directive('switcher', {

    bind: function(el, binding, vnode: MyVNode) {

      vnode.switcherTimeout = 0;
      vnode.switcherStart = async function() {
        vnode.context!.logger.debug("Triggered onMouseDown, waiting {}ms for the next event...", HOLD_TIMEOUT)();
        getEventName('end').forEach(eventName => el.addEventListener(eventName, vnode.switcherFinish!))
        await new Promise((resolve) => vnode.switcherTimeout = window.setTimeout(resolve, HOLD_TIMEOUT));
        vnode.switcherTimeout = 0;
        vnode.context!.logger.debug("Timeout expired, firing enable record action")();
        await binding.value.start();

      };
      // @ts-ignore: next-line
      vnode.switcherFinish = async function(e: Event) {
        getEventName('end').forEach(eventName => el.removeEventListener(eventName, vnode.switcherFinish!))
        if (vnode.switcherTimeout) {
          vnode.context!.logger.debug("Click event detected, firing switch recrod action")();
          clearTimeout(vnode.switcherTimeout);
          vnode.switcherTimeout = 0;
          binding.value.switch();
        } else {
          vnode.context!.logger.debug("Release event detected, firing stop record action")();
          binding.value.stop()
        }
      }
      getEventName('start').forEach(eventName => el.addEventListener(eventName, vnode.switcherStart!))
    },
    unbind: function(el, binding, vnode: MyVNode) {
      getEventName('start').forEach(eventName => el.removeEventListener(eventName, vnode.switcherStart!))
      getEventName('end').forEach(eventName => el.removeEventListener(eventName, vnode.switcherFinish!))
    }
  });
}


declare module 'vue/types/vue' {

  interface Vue {
    __logger: Logger;
    id?: number|string;
  }
}


export function declareMixins() {
  const mixin = {
    computed: {
      logger(this: Vue): Logger  {
        if (!this.__logger && this.$options._componentTag !== 'router-link') {
          let name = this.$options._componentTag || 'vue-comp';
          if (!this.$options._componentTag) {
            globalLogger.warn('Can\'t detect tag of {}', this)();
          }
          if (this.id) {
            name += `:${this.id}`;
          }
          this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
        }

        return this.__logger;
      }
    },
    updated: function (this: Vue): void {
      this.logger && this.logger.trace('Updated')();
    },
    created: function(this: Vue) {
      this.logger &&  this.logger.trace('Created')();
    }
  };
  Vue.mixin(<ComponentOptions<Vue>><unknown>mixin);
}
