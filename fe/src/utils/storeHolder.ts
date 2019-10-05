import {getModule} from 'vuex-module-decorators';
import {DefaultStore} from '@/utils/store';
import Vue from 'vue';

export const store: DefaultStore = getModule(DefaultStore);

Vue.prototype.store = store;
