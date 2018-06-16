import Vue from 'vue';

import App from './components/App.vue';
import {globalLogger, storage, ws} from './utils/singletons';
import store from './store';
import router from './router';

window.onerror = function() {

}

document.addEventListener('DOMContentLoaded', function () {
  storage.connect(finished => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app');
  });
});
