import Register from './Register.vue';
import Main from './Main.vue';
import ResetPassword from './ResetPassword.vue';
import Login from './Login.vue';
import ApplyResetPassword from './ApplyResetPassword.vue';

export default {
  path: '/auth',
  component: Main,
  name: 'auth',
  children: [
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
    },
    {
      path: 'proceed-reset-password',
      component: ApplyResetPassword,
      name: 'proceed-reset',
    }
  ]
};