import {HandlerType, HandlerTypes} from '@/types/types';
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

      }
    }
  }

  validate(data: DefaultMessage) {
    let validator = this.validators[data.handler];
    if (!validator) {
      throw Error(`Security Error: Unknown validator for this message ${data.handler}`)
    }
    let action = validator[data.action];
    if (!action) {
      throw Error(`Security Error: Unknown action for this message [${data.handler}][${data.action}]`)
    }
    action.bind(this)(data);
  }

}

