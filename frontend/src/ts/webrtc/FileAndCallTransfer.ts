import BaseTransferHandler from "@/ts/webrtc/BaseTransferHandler";
import Subscription from "@/ts/classes/Subscription";

export abstract class FileAndCallTransfer extends BaseTransferHandler {
  public checkTransferDestroy(payload: CheckTransferDestroyMessage) {
    this.logger.log("Checkign destroy")();
    if (this.connectionId && this.sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId)) === 0) {
      this.onDestroy();
    }
  }
}
