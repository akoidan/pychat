import {getAverageAudioLevel} from '../utils/audioprocc';
import AbstractPeerConnection from './AbstractPeerConnection';
import {SetCallOpponent, SetOpponentAnchor, SetOpponentVoice} from '../types/types';

export default class CallPeerConnection {

  private asp: AbstractPeerConnection;

  constructor(asp: AbstractPeerConnection) {
    this.asp = asp;
    let payload:  SetCallOpponent = {
      connId: this.asp.connectionId,
      roomId: this.asp.roomId,
      callInfoModel: {
        anchor: null,
        opponentCurrentVoice: 0,
        opponentVolume: 100
      }
    };
    this.asp.store.commit('setCallOpponent', payload);
  }

 oniceconnectionstatechange () {
   if (this.asp.pc.iceConnectionState === 'disconnected') {
     this.asp.logger.log('disconnected')();
     this.closeEvents('Connection has been lost');
   } else if (['completed', 'connected'].indexOf(this.asp.pc.iceConnectionState) >= 0) {
     this.asp.logger.log('running')();
   }
 }


  createPeerConnection (stream) {
    this.asp.pc.onaddstream =  (event) => {
      this.asp.logger.log('onaddstream')();
      let payload: SetOpponentAnchor = {
        anchor: URL.createObjectURL(event.stream),
        connId: this.asp.connectionId,
        roomId: this.asp.roomId
      };
      this.asp.store.commit('setOpponentAnchor', payload);
      //
      // if (p) { //firefox video.play doesn't return promise
      //   // chrome returns promise, if it's on mobile devices video sound would be muted
      //   // coz it initialized from network instead of user gesture
      //   p.catch(Utils.clickToPlay(this.dom.remote))
      // }
      // var speakerId = getSpeakerId();
      // if (speakerId && this.dom.remote.setSinkId) {
      //   this.dom.remote.setSinkId(speakerId);
      // }
      // this.removeAudioProcessor();
      // this.audioProcessor = Utils.createMicrophoneLevelVoice(event.stream, this.processAudio);
      // onStreamAttached(this.opponentWsId);
    };
    stream && this.asp.pc.addStream(stream);
  }

  processAudio (audioProc) {
    return () => {
      let level = getAverageAudioLevel(audioProc); // 256 max
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

      let payload: SetOpponentVoice = {
        voice: clasNu,
        connId: this.asp.connectionId,
        roomId: this.asp.roomId
      };
      this.asp.store.commit('setOpponentVoice', payload);
    };
  }

  removeAudioProcessor () {
    // if (this.audioProcessor && this.audioProcessor.javascriptNode && this.audioProcessor.javascriptNode.onaudioprocess) {
    //   this.audioProcessor.javascriptNode.onaudioprocess = null;
    //   this.logger.log("Removed remote audioProcessor")();
    // }
  }

  closeEvents(reason) {
    // if (this.timeoutedPeerConnectionDisconnected) {
    //   clearTimeout(this.timeoutedPeerConnectionDisconnected);
    //   this.timeoutedPeerConnectionDisconnected = null;
    //   logger.log("Removing connections lost timeout")();
    // }
    this.asp.logger.log('Destroying CallPeerConnection because', reason)();
    this.asp.closePeerConnection();
    this.removeAudioProcessor();
    this.asp.onDestroy();
    let payload:  SetCallOpponent = {
      connId: this.asp.connectionId,
      roomId: this.asp.roomId,
      callInfoModel: null,
    };
    this.asp.store.commit('setCallOpponent', payload);
  }

  ondestroyCallConnection (message) {
    this.closeEvents('Opponent hang up');
  }
}