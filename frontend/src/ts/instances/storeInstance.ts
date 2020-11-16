import { getModule } from 'vuex-module-decorators';
import { stateDecoratorFactory } from 'vuex-module-decorators-state';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { IS_DEBUG } from '@/ts/utils/consts';

export const store: DefaultStore = getModule(DefaultStore);
export const State = stateDecoratorFactory(store);

// Allow only boolean fields be pass to ApplyGrowlErr
type ClassType = new (...args: any[]) => any;
type ValueFilterForKey<T extends InstanceType<ClassType>, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];


// TODO add success growl, and specify error property so it reflects forever in comp
export function ApplyGrowlErr<T extends InstanceType<ClassType>>(
    {message, runningProp, vueProperty}: {
      message?: string;
      runningProp?: ValueFilterForKey<T, boolean>;
      vueProperty?: ValueFilterForKey<T, string>;
    }
) {
  const processError = function (e: Error|string) {
    const strError: string = String((<Error>e)?.message || e || 'Unknown error');
    if (vueProperty && message) {
      // @ts-ignore: next-line
      this[vueProperty] = `${message}: ${strError}`;
    } else if (message) {
      store.growlError(`${message}:  ${strError}`);
    } else if (vueProperty) {
      // @ts-ignore: next-line
      this[vueProperty] = `Error: ${strError}`;
    } else {
      store.growlError(strError);
    }
  };

  return function (target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args: unknown[]) {
      // @ts-ignore: next-line

      // TODO this thing breaks fb login
      // if (this[runningProp]) {
      //   // @ts-ignore: next-line
      //   this.logger.warn('Skipping {} as it\'s loading', descriptor.value)();
      //   return;
      // }
      try {
        if (runningProp) {
          // @ts-ignore: next-line
          this[runningProp] = true;
        }
        const a =  await original.apply(this, args);
        if (vueProperty) {
          // @ts-ignore: next-line
          this[vueProperty] = '';
        }

        return a;
      } catch (e) {
        processError.call(this, e);
      } finally {
        if (runningProp) {
          // @ts-ignore: next-line
          this[runningProp] = false;
        }
      }
    };
  };
}

if (IS_DEBUG) {
  window.store = store;
}