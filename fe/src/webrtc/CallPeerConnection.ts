import {
  createMicrophoneLevelVoice,
  getAverageAudioLevel
} from '@/utils/audioprocc';
import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';
import {
  ChangeStreamMessage, JsAudioAnalyzer,
  SetCallOpponent,
  SetOpponentAnchor,
  SetOpponentVoice
} from '@/types/types';
import WsHandler from '@/utils/WsHandler';
import {DefaultStore} from'@/utils/store';
import {ConnectToRemoteMessage, DefaultMessage} from '@/types/messages';

export default abstract class CallPeerConnection extends AbstractPeerConnection {
  private audioProcessor: any;

  constructor(
      roomId: number,
      connId: string,
      opponentWsId: string,
      userId: number,
      wsHandler: WsHandler,
      store: DefaultStore
  ) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    const payload:  SetCallOpponent = {
      opponentWsId: this.opponentWsId,
      roomId: this.roomId,
      callInfoModel: {
        connected: false,
        mediaStreamLink: null,
        userId,
        opponentCurrentVoice: 0
      }
    };
    this.store.setCallOpponent(payload);
  }

  public oniceconnectionstatechange() {
    if (this.pc!.iceConnectionState === 'disconnected') {
      this.logger.log('disconnected')();
      this.onDestroy('Connection has been lost');
    } else if (['completed', 'connected'].indexOf(this.pc!.iceConnectionState) >= 0) {
      this.logger.log('running')();
    }
  }

  public onStreamChanged(payload: ChangeStreamMessage) {
    if (this.pc) {
      payload.oldStream && this.pc.removeStream(payload.oldStream);
      this.pc.addStream(payload.newStream);
      this.createOffer();
    }
  }

  public createPeerConnection (event: ConnectToRemoteMessage) {
    super.createPeerConnection();
    this.pc!.onaddstream =  (event: MediaStreamEvent) => {
      this.logger.log('onaddstream')();
      const payload: SetOpponentAnchor = {
        anchor: event.stream!,
        opponentWsId: this.opponentWsId,
        roomId: this.roomId
      };
      this.store.setOpponentAnchor(payload);

      if (this.sendRtcDataQueue.length > 0) {
        this.logger.log('Connection accepted, consuming sendRtcDataQueue')();
        const queue = this.sendRtcDataQueue;
        this.sendRtcDataQueue = [];
        queue.forEach(this.onsendRtcData);
      }
      //
      // if (p) { //firefox video.play doesn't return promise
      //   // chrome returns promise, if it's on mobile devices video sound would be muted
      //   // coz it initialized from network instead of user gesture
      //   p.catch(Utils.clickToPlay(this.dom.remote))
      // }
      this.removeAudioProcessor();
      this.audioProcessor = createMicrophoneLevelVoice(event.stream!, this.processAudio.bind(this));
      // onStreamAttached(this.opponentWsId);
    };
    this.logger.log('Sending local stream to remote')();
    event && event.stream && this.pc!.addStream(event.stream);
  }

  public processAudio (audioProc: JsAudioAnalyzer) {
    return () => {
      const level = getAverageAudioLevel(audioProc); // 256 max
      let clasNu;
      if (level < 0.5) {
        clasNu = 0;
      } else if (level < 5) {
        clasNu = 1;
      } else if (level < 12) {
        clasNu = 2;
      } else if (level < 25) {
        clasNu = 3;
      } else if (level < 50) {
        clasNu = 4;
      } else if (level < 90) {
        clasNu = 5;
      } else if (level < 110) {
        clasNu = 6;
      } else if (level < 140) {
        clasNu = 7;
      } else if (level < 180) {
        clasNu = 8;
      } else {
        clasNu = 9;
      }

      const payload: SetOpponentVoice = {
        voice: clasNu,
        opponentWsId: this.opponentWsId,
        roomId: this.roomId
      };
      this.store.setOpponentVoice(payload);
    };
  }

  public removeAudioProcessor () {
    if (this.audioProcessor && this.audioProcessor.javascriptNode && this.audioProcessor.javascriptNode.onaudioprocess) {
      this.audioProcessor.javascriptNode.onaudioprocess = null;
      this.logger.log('Removed remote audioProcessor')();
    }
  }

  public onDestroy(reason?: DefaultMessage|string) {
    this.logger.log('Destroying {}, because', this.constructor.name, reason)();
    this.closePeerConnection();
    this.removeAudioProcessor();
    super.onDestroy();
    const payload:  SetCallOpponent = {
      opponentWsId: this.opponentWsId,
      roomId: this.roomId,
      callInfoModel: null
    };
    this.store.setCallOpponent(payload);
  }

}
