import ChannelsPage from './ChannelsPage.vue';
import MainPage from './MainPage.vue';
import sessionHolder from '../../utils/sessionHolder';
import loggerFactory from '../../utils/loggerFactory';

const logger = loggerFactory.getLogger('ROUTE', 'color: black;');
export default {
  path: '/',
  component: MainPage,
  children: [{
    component: ChannelsPage,
    path: '/chat',
    children: [

    ],
  }]
};