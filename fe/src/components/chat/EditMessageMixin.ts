
import {Component, Watch, Mixins} from 'vue-property-decorator';
const ONE_DAY = 24 * 60 * 60 * 1000;
import Vue from 'vue';
import {globalLogger} from '../../utils/singletons';
import {CurrentUserInfoModel, EditingMessage, MessageModel} from '../../model';

@Component

export default class EditMessageMixin extends Vue {

  sem(event, message: MessageModel, isEditingNow: boolean) {
    globalLogger.log('SEM')();
    if (message.userId === this['userInfo'].userId && !message.deleted && message.time + ONE_DAY > Date.now()) {
      event.preventDefault();
      event.stopPropagation();
      this['setEditedMessage']({messageId: message.id, isEditingNow, roomId: message.roomId} as EditingMessage);
    }
  }
}
