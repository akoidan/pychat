// import FileTransferHandler from './FileTransferHandler';
// import {channelsHandler, notifier} from '../utils/singletons';
// import {faviconUrl} from '../utils/utils';
// import {checkAndPlay, file} from '../utils/audio';
//
import FileTransferHandler from './FileTransferHandler';
import {DefaultMessage} from '../types/messages';

export default  class FileReceiver extends FileTransferHandler {
  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> };

}
//   private fileSize: number;
//   private fileName: string;
//
//   showOffer(message) {
//     this.fileSize = parseInt(message.content.size);
//     this.fileName = message.content.name;
//     if (this.store.state.roomsDict[message.roomId].notifications) {
//       this.notifier.showNotification(message.user, {
//         body: `Sends file ${this.fileName}`,
//         icon: faviconUrl,
//         requireInteraction: true
//       });
//     }
//     if (this.store.state.userSettings.incomingFileCallSound) {
//       checkAndPlay(file, this.store.state.roomsDict[message.roomId].volume);
//     }
//   }
//
//   yesAction () {
//     this.hideButtons();
//     this.acceptFileReply();
//   }
//
//   this.hideButtons = function () {
//     if (this.dom.yesNoHolder) {
//       CssUtils.hideElement(this.dom.yesNoHolder)
//     }
//   };
//   this.addYesNo = function () {
//     this.dom.yesNoHolder = document.createElement('DIV');
//     this.dom.yes = document.createElement('INPUT');
//     this.dom.no = document.createElement('INPUT');
//     this.dom.body.appendChild(this.dom.yesNoHolder);
//     this.dom.yesNoHolder.appendChild(this.dom.yes);
//     this.dom.yesNoHolder.appendChild(this.dom.no);
//     this.dom.yesNoHolder.className = 'yesNo';
//     this.dom.yes.onclick = this.yesAction;
//     this.dom.no.onclick = this.noAction;
//     this.dom.yes.setAttribute('type', 'button');
//     this.dom.no.setAttribute('type', 'button');
//     this.dom.yes.setAttribute('value', 'Accept');
//     this.dom.no.setAttribute('value', 'Decline');
//     this.fixInputs();
//   };
//   this.sendErrorFSApi = function () {
//     let bsize = bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API);
//     wsHandler.sendToServer({
//       action: 'destroyFileConnection',
//       connId: this.connectionId,
//       content: "User's browser doesn't support accepting files over {}"
//           .format(bsize)
//     });
//   };
//   this.acceptFileReply = function () {
//     if (this.fileSize > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem) {
//       this.sendErrorFSApi();
//       growlError("Your browser doesn't support receiving files over {}".format(bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)))
//     } else {
//       this.peerConnections[this.offerOpponentWsId] = new FileReceiverPeerConnection(
//           this.connectionId,
//           this.offerOpponentWsId,
//           this.fileName,
//           this.fileSize,
//           this.removeChildPeerReference
//       );
//       let div = document.createElement("DIV");
//       this.dom.body.appendChild(div);
//       let db = new DownloadBar(div, this.fileSize, this.dom.connectionStatus);
//       this.peerConnections[this.offerOpponentWsId].setDownloadBar(db); // should be before initFileSystemApi
//       this.peerConnections[this.offerOpponentWsId].initFileSystemApi(this.sendAccessFileSuccess);
//     }
//   };
//   this.sendAccessFileSuccess = function (fileSystemSucess) {
//     if (fileSystemSucess || this.fileSize < MAX_ACCEPT_FILE_SIZE_WO_FS_API) {
//       this.peerConnections[this.offerOpponentWsId].waitForAnswer();
//       wsHandler.sendToServer({
//         action: 'acceptFile',
//         connId: this.connectionId,
//         content: {received: 0}
//       });
//     } else {
//       this.sendErrorFSApi();
//       this.peerConnections[this.offerOpponentWsId].ondestroyFileConnection("Browser doesn't support acepting file sizes over {}".format(bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)));
//     }
//   };
//   this.ondestroyFileConnection = function (message) {
//     if (this.peerConnections[message.opponentWsId]) {
//       this.peerConnections[message.opponentWsId].ondestroyFileConnection(message);
//     } else {
//       this.hideButtons();
//       this.dom.connectionStatus.textContent = "Opponent declined sending";
//     }
//   };
//
//   this.initAndDisplayOffer = function (message) {
//     this.connectionId = message.connId;
//     logger.log("initAndDisplayOffer file")();
//     this.offerOpponentWsId = message.opponentWsId;
//     wsHandler.sendToServer({
//       action: 'replyFile',
//       connId: message.connId,
//       content: {browser: browserVersion}
//     });
//     this.showOffer(message);
//   };
// }