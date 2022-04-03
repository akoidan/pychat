import {IS_ANDROID} from "@/ts/utils/consts";
import {isMobile} from "@/ts/utils/runtimeConsts";

export function validityDirective(el: HTMLElement, binding: any) {
  (<HTMLInputElement>el).setCustomValidity(binding.value);
}


function getEventName(eventType: "end" | "start"): string[] {
  if (IS_ANDROID || isMobile) {
    return eventType === "start" ? ["touchstart"] : ["touchend"];
  }
  return eventType === "start" ? ["mousedown"] : ["mouseleave", "mouseup"];
}

const HOLD_TIMEOUT = 300;

/*
 * This directive detects whether user clicked on event, or holds the event
 * if user mouse down and keeps it down for HOLD_TIMEOUT, start event would be fired
 * otherwise switch event woould be fired
 *  v-switcher="{start: mousedownevent, stop: releaseRecord, switch: clickevent}"
 */
export const switchDirective = {
  created(el: any, binding: any, vnode: any) {
    vnode.switcherTimeout = 0;
    vnode.switcherStart = async function() {
      vnode.context!.$logger.debug("Triggered onMouseDown, waiting {}ms for the next event...", HOLD_TIMEOUT)();
      getEventName("end").forEach((eventName) => el.addEventListener(eventName, vnode.switcherFinish!));
      await new Promise((resolve) => vnode.switcherTimeout = window.setTimeout(resolve, HOLD_TIMEOUT));
      vnode.switcherTimeout = 0;
      vnode.context!.$logger.debug("Timeout expired, firing enable record action")();
      await binding.value.start();
    };
    vnode.switcherFinish = async function(e: Event) {
      getEventName("end").forEach((eventName) => el.removeEventListener(eventName, vnode.switcherFinish!));
      if (vnode.switcherTimeout) {
        vnode.context!.$logger.debug("Click event detected, firing switch recrod action")();
        clearTimeout(vnode.switcherTimeout);
        vnode.switcherTimeout = 0;
        binding.value.switch();
      } else {
        vnode.context!.$logger.debug("Release event detected, firing stop record action")();
        binding.value.stop();
      }
    };
    getEventName("start").forEach((eventName) => el.addEventListener(eventName, vnode.switcherStart!));
  },
  unmounted(el: any, binding: any, vnode: any) {
    getEventName("start").forEach((eventName) => el.removeEventListener(eventName, vnode.switcherStart!));
    getEventName("end").forEach((eventName) => el.removeEventListener(eventName, vnode.switcherFinish!));
  },
};
