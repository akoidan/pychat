import type {VueBase} from "vue-class-component";
import type {VuexModule} from "vuex-module-decorators";
import {getModule} from "vuex-module-decorators";
import {DefaultStore} from "@/ts/classes/DefaultStore";
import {encodeHTML} from "@/ts/utils/htmlApi";
import {GrowlType} from "@/ts/types/model";


function stateDecoratorFactory<TPT extends VuexModule>(vuexModule: TPT):
<TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
(vueComponent: TCT, fileName: TPN) => void {
  return <TCT extends (TCT[TPN] extends TPT[TPN] ? unknown : never), TPN extends (keyof TCT & keyof TPT)>
  (vueComponent: TCT, fileName: TPN): void => {
    Object.defineProperty(
      vueComponent,
      fileName,
      Object.getOwnPropertyDescriptor(
        vuexModule,
        fileName,
      )!,
    );
  };
}


export const store: DefaultStore = getModule(DefaultStore);
export const State = stateDecoratorFactory(store);

// Allow only boolean fields be pass to ApplyGrowlErr
type ClassType = new (...args: any[]) => any;
type ValueFilterForKey<T extends InstanceType<ClassType>, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];


// TODO add success growl, and specify error property so it reflects forever in comp
export function ApplyGrowlErr<T extends InstanceType<ClassType>>(
  {message, runningProp, vueProperty, preventStacking}: {
    message?: string;
    preventStacking?: boolean;
    runningProp?: ValueFilterForKey<T, boolean>;
    vueProperty?: ValueFilterForKey<T, string>;
  },
) {
  const processError = function(e: any) {
    let strError;
    if (e) {
      if (e.message) {
        strError = e.message;
      } else if (e.error) {
        strError = String(e.error);
      } else {
        strError = String(e);
      }
    } else {
      e = "Unknown error";
    }
    // @ts-expect-error: next-line
    const processError: VueBase = this;
    processError.$logger.error(`Error during ${message} {}`, e)();
    if (vueProperty && message) {
      // @ts-expect-error: next-line
      processError[vueProperty] = `${message}: ${strError}`;
    } else if (message) {
      processError.$store.showGrowl({
        html: encodeHTML(`${message}:  ${strError}`),
        type: GrowlType.ERROR,
        time: 20000,
      });
    } else if (vueProperty) {
      // @ts-expect-error: next-line
      this[vueProperty] = `Error: ${strError}`;
    } else {
      processError.$store.showGrowl({
        html: encodeHTML(strError),
        type: GrowlType.ERROR,
        time: 20000,
      });
    }
  };

  return function(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args: unknown[]) {
      // @ts-expect-error: next-line

      // TODO this thing breaks fb login
      if (preventStacking && this[runningProp]) {
        (this as VueBase).$logger.warn("Skipping {} as it's loading", descriptor.value)();
        return;
      }
      try {
        if (runningProp) {
          // @ts-expect-error: next-line
          this[runningProp] = true;
        }
        const a = await original.apply(this, args);
        if (vueProperty) {
          // @ts-expect-error: next-line
          this[vueProperty] = "";
        }

        return a;
      } catch (e) {
        processError.call(this, e);
      } finally {
        if (runningProp) {
          // @ts-expect-error: next-line
          this[runningProp] = false;
        }
      }
    };
  };
}

