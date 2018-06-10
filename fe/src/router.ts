import Vue from 'vue';
import VueRouter from 'vue-router';
import Register from './components/singup/Register.vue';
import Main from './components/singup/Main.vue';
import ResetPassword from './components/singup/ResetPassword.vue';
import Login from './components/singup/Login.vue';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/auth',
      component: Main,
      name: 'auth',
      children: [
        {
          path: '',
          beforeEnter: (to, from, next) => next('/auth/login')
        },
        {
          path: 'login',
          component: Login,
          name: 'login',
        },
        {
          path: 'reset-password',
          component: ResetPassword,
          name: 'reset-password',
        },
        {
          path: 'sign-up',
          component: Register,
          name: 'register',
        }
      ]
    },
  ],
});