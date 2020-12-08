import { CheckTransferDestroy } from '@/ts/types/messages/innerMessages';
import BaseTransferHandler from '@/ts/webrtc/BaseTransferHandler';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';

export abstract class FileAndCallTransfer  extends  BaseTransferHandler {

  public checkTransferDestroy(payload: CheckTransferDestroy) {
    this.logger.log("Checkign destroy")();
    if (this.connectionId && sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId!)) === 0) {
      this.onDestroy();
    }
  }

}
