import {getModule} from 'vuex-module-decorators';
import {stateDecoratorFactory} from 'vuex-module-decorators-state';
import {DefaultStore} from '@/utils/store';
import {IS_DEBUG} from '@/utils/consts';
import Vue from 'vue';

export const store: DefaultStore = getModule(DefaultStore);
export const State = stateDecoratorFactory(store);

Vue.prototype.store = store;

if (IS_DEBUG) {
  window.store = store;
}
