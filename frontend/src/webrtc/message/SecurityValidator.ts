import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
import {DefaultMessage, PrintMessage} from '@/types/messages';
import {DefaultStore} from '@/utils/store';

/** The message that are sent directly from another user is not trusted
 * That's why this class lead to eliminate OWASP broken access control
 */
export class SecurityValidator {
  private roomId: number;
  private store: DefaultStore;
  private opponentUseId: number;

  get room() {
    return this.store.roomsDict[this.roomId];
  }

  constructor(roomId: number, opponentUseId: number, store: DefaultStore) {
    this.store = store;
    this.roomId = roomId;
    this.opponentUseId = opponentUseId;
  }
  protected readonly validators: Record<string, Record<string, Function>> = {


    channels: {
      printMessage: (message: PrintMessage) => {
        if (message.roomId != this.roomId) {
          throw Error(`Can process message. Because user ${this.opponentUseId} doesn't have access to room ${message.roomId} `);
        }
        if (message.userId != this.opponentUseId) {
          throw Error(`Can process message, because user ${message.userId} is not who he is ${this.opponentUseId}`);
        }
      }
    }
  }

  validate(data: DefaultMessage) {
    this.validators[data.handler][data.action]();
  }

}

