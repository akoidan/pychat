import {getModule} from 'vuex-module-decorators';
import {DefaultStore} from '@/utils/store';
import {VuexModule} from 'vuex-module-decorators';
import Vue from 'vue';

function StateDecoratorFactory<ProviderType extends VuexModule> (vuexModule: ProviderType) {
  return function Prop<ConsumerType extends (ConsumerType[PropName] extends ProviderType[PropName] ? unknown : never),
      PropName extends (keyof ConsumerType & keyof ProviderType),
      >(vueComponent: ConsumerType,
        fileName: PropName) {
    {
      Object.defineProperty(vueComponent, fileName, {
        get: () => {debugger; return vuexModule[fileName]},
        set: (v) => {throw Error(`Can't set value ${vueComponent}.${fileName} to value ${v}. Vuex module ${vuexModule}`); },
      });
    }
  };
}

export const store: DefaultStore = getModule(DefaultStore);
export const State = StateDecoratorFactory(store);

Vue.prototype.$store = store;
