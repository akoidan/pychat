import ChannelsPage from './ChannelsPage.vue';
import MainPage from './MainPage.vue';
import sessionHolder from '../../utils/sessionHolder';
import loggerFactory from '../../utils/loggerFactory';
import store from '../../store';

const logger = loggerFactory.getLogger('ROUTE', 'color: black;');
export default {
  path: '',
  component: MainPage,
  children: [
    {
      path: '',
      beforeEnter: (to, from, next) => next('/chat/1')
    },
    {
      component: ChannelsPage,
      path: '/chat/:id',
      name: 'chat'
    }
  ]
};