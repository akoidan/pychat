import { DefaultStore } from '@/ts/classes/DefaultStore';
import { DefaultP2pMessage } from "@/ts/types/messages/p2pMessages";

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
    'this': {
      printMessage: () => {

      }
    }
  }

  validate(data: DefaultP2pMessage<string>) {
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

