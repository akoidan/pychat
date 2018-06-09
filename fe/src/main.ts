import Vue from 'vue';

import App from './components/App.vue';
import {storage, ws} from './utils/singletons';
import store from './store';
import router from './router';


document.addEventListener('DOMContentLoaded', function () {
  storage.connect(finished => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app');
    let sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      ws.listenWS();
    } else {
      router.replace('/auth');
    }
  });
});
