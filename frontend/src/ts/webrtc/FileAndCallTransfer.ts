import BaseTransferHandler from "@/ts/webrtc/BaseTransferHandler";
import Subscription from "@/ts/classes/Subscription";
import type {
  CheckTransferDestroyMessage,
} from "@/ts/types/messages/inner/check.transfer.destroy";
import {
  CheckTransferDestroyBody,
} from "@/ts/types/messages/inner/check.transfer.destroy";
import {Subscribe} from "@/ts/utils/pubsub";

export abstract class FileAndCallTransfer extends BaseTransferHandler {
  @Subscribe<CheckTransferDestroyMessage>()
  public checkTransferDestroy(payload: CheckTransferDestroyBody) {
    this.logger.log("Checkign destroy")();
    if (this.connectionId && this.sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId)) === 0) {
      this.onDestroy();
    }
  }
}
