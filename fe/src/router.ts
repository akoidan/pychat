import Vue from 'vue';
import VueRouter from 'vue-router';
import signup from './components/singup/router';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [signup],
});