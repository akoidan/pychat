import BaseTransferHandler from './BaseTransferHandler';
import {
  AcceptCallMessage,
  ConnectToRemoteMessage,
  DefaultMessage,
  OfferCall,
  ReplyCallMessage,
  WebRtcSetConnectionIdMessage
} from '../types/messages';
import {browserVersion, isChrome, isMobile} from '../utils/singletons';
import {sub} from '../utils/sub';
import Subscription from '../utils/Subscription';
import {CallsInfoModel, IncomingCallModel} from '../types/model';
import {
  BooleanIdentifier,
  ChangeStreamMessage,
  JsAudioAnalyzer,
  NumberIdentifier,
  SetDevices,
  StringIdentifier, VideoType
} from '../types/types';
import {CHROME_EXTENSION_ID, CHROME_EXTENSION_URL} from '../utils/consts';
import {extractError, forEach} from '../utils/utils';
import {createMicrophoneLevelVoice, getAverageAudioLevel} from '../utils/audioprocc';
import CallSenderPeerConnection from './CallSenderPeerConnection';
import CallReceiverPeerConnection from './CallReceiverPeerConnection';
import router from '../router';

export default class CallHandler extends BaseTransferHandler {
  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    answerCall: this.answerCall,
    videoAnswerCall: this.videoAnswerCall,
    declineCall: this.declineCall,
    replyCall: this.replyCall,
    acceptCall: this.onacceptCall,
    removePeerConnection: this.removePeerConnection,
  };
  private localStream: MediaStream;
  private audioProcessor: JsAudioAnalyzer;
  private callStatus: string;
  private acceptedPeers: string[] = [];

  inflateDevices(devices) {
    let n, k, c = 0;
    let microphones = {};
    let speakers = {};
    let webcams = {};
    let payload: SetDevices = {
      microphones,
      webcams,
      speakers
    };
    if (devices) {
      devices.forEach(function (device) {
        switch (device.kind) {
          case 'audioinput':
            microphones[device.deviceId] = device.label || 'Microphone ' + (++n);
            break;
          case 'audiooutput':
            speakers[device.deviceId] = device.label || 'Speaker ' + (++k);
            break;
          case 'videoinput':
            webcams[device.deviceId] = device.label || 'Camera ' + (++c);
            break;
        }
      });
    }
    this.store.commit('setDevices', payload);
  }

  onacceptCall(message: AcceptCallMessage) {
    if (this.callStatus !== 'received_offer') { // if we're call initiator
      let payload: ConnectToRemoteMessage = {
        action: 'connectToRemote',
        handler: Subscription.getPeerConnectionId(this.connectionId, message.opponentWsId),
        stream: this.localStream
      };
      sub.notify(payload);
    } else {
      this.acceptedPeers.push(message.opponentWsId);
    }
  }

  pingExtension(cb) {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      let triggered = false;
      let timedCB = setTimeout(function () {
        !triggered && cb(false);
        triggered = true;
      }, 500);

      chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
        type: 'PYCHAT_SCREEN_SHARE_PING'
      }, function (response) {
        !triggered && cb(response && response.data === 'success');
        clearTimeout(timedCB);
      });
    } else {
      cb(false);
    }
  }


  async getDesktopShareFromExtension() {
    return new Promise( (res, rej) => {
      if (!isChrome) {
        rej('ScreenCast feature is only available from chrome atm');
      } else if (isMobile) {
        rej('ScreenCast is not available for mobile phones yet');
      } else {
        this.pingExtension( (success) => {
          this.logger.log('Ping to extension succeeded')();
          if (success) {
            chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
              type: 'PYCHAT_SCREEN_SHARE_REQUEST'
            }, (response) => {
              if (response && response.data === 'success') {
                this.logger.log('Getting desktop share succeeded')();
                res({
                  audio: false,
                  video: {
                    mandatory: {
                      chromeMediaSource: 'desktop',
                      chromeMediaSourceId: response.streamId,
                      maxWidth: window.screen.width,
                      maxHeight: window.screen.height
                    }
                  }
                });
              } else {
                rej('Failed to capture desktop stream');
              }
            });
          } else {
            rej({rawError: `To share your screen you need chrome extension.<b> <a href="${CHROME_EXTENSION_URL}" target="_blank">Click to install</a></b>`});
          }
        });
      }
    });
  }

  async captureInput() {
    let endStream;
    this.logger.debug('capturing input')();
    if (this.callInfo.showMic || this.callInfo.showVideo) {
      let audio: any = this.callInfo.showMic;
      if (this.callInfo.currentMic && audio) {
        audio = {deviceId: this.callInfo.currentMic};
      }
      let video: any = this.callInfo.showVideo; // convert null to bolean, if we pass null to getUserMedia it tries to capture
      if (this.callInfo.currentWebcam && video) {
        video = {deviceId: this.callInfo.currentWebcam};
      }
      endStream = await navigator.mediaDevices.getUserMedia({audio, video});
      this.logger.debug('navigator.mediaDevices.getUserMedia({audio, video})')();
      if (navigator.mediaDevices.enumerateDevices) {
        let devices = await navigator.mediaDevices.enumerateDevices();
        this.inflateDevices(devices);
      }
    }
    if (this.callInfo.shareScreen) {
      let share = await this.getDesktopShareFromExtension();
      this.logger.debug('Resolving userMedia from dekstopShare')();
      let stream = await navigator.mediaDevices.getUserMedia(share);
      let tracks: any[] = stream.getVideoTracks();
      if (!(tracks && tracks.length > 0)) {
        throw 'No video tracks from captured screen';
      }
      tracks[0].isShare = true;
      if (endStream) {
        endStream.addTrack(tracks[0]);
      } else {
        endStream = stream;
      }
    }
    return endStream;
  }

  private handleStream(e, endStream) {
    let what = [];
    if (this.callInfo.showMic) {
      what.push('audio');
    }
    if (this.callInfo.showVideo) {
      what.push('video');
    }
    if (this.callInfo.shareScreen) {
      what.push('screenshare');
    }
    let message = `<span>Failed to capture ${what.join(', ')} source</span>, because ${extractError(e)}`;
    this.destroyStreamData(endStream);
    this.store.dispatch('growlErrorRaw', message);
    this.logger.error('onFailedCaptureSource {}', e)();
  }

  private get callInfo(): CallsInfoModel {
    return this.store.state.roomsDict[this.roomId].callInfo;
  }

  private destroyStreamData(endStream) {
    if (endStream) {
      forEach(endStream.getTracks(), e => {
        e.stop();
      });
    }
  }

  processAudio (audioProc)  {
    return  () => {
      if (!this.callInfo.showMic) {
        return;
      }
      if (audioProc.volumeValuesCount < 101) {
        audioProc.prevVolumeValues += getAverageAudioLevel(audioProc);
        audioProc.volumeValuesCount++;
        if (audioProc.volumeValuesCount === 100 && audioProc.prevVolumeValues === 0) {
          let url = isChrome ? 'setting in chrome://settings/content' : 'your browser settings';
          url += navigator.platform.indexOf('Linux') >= 0 ?
              '. Open pavucontrol for more info' :
              ' . Right click on volume icon in system tray -> record devices -> input -> microphone';
          this.store.dispatch('growlError', `Unable to capture input from microphone. Check your microphone connection or ${url}`);
        }
      }
      let payload: NumberIdentifier = {
        id: this.roomId,
        state: Math.sqrt(getAverageAudioLevel(audioProc)),
      };
      this.store.commit('setCurrentMicLevel', payload);
    };
  }

  async toggleDevice(videoType: VideoType) {
    let track = this.getTrack(videoType);
    if (track && track.readyState === 'live') {
      this.logger.log('toggleDevice')();
      let state = false;
      if (videoType === VideoType.AUDIO) {
        state = this.callInfo.showMic;
      } else if (videoType === VideoType.SHARE) {
        state = this.callInfo.shareScreen;
      } else if (videoType === VideoType.VIDEO) {
        state = this.callInfo.showVideo;
      }
      track.enabled = state;
    } else {
      await this.updateConnection();
    }
  }

  async updateConnection() {
    this.logger.log('updateConnection')();
    let stream;
    if (this.localStream && this.localStream.active) {
      try {
        stream = await this.captureInput();
        this.stopLocalStream();
        this.attachLocalStream(stream);

        this.webrtcConnnectionsIds.forEach(pcName => {
          let message: ChangeStreamMessage = {
            handler: Subscription.getPeerConnectionId(this.connectionId, pcName),
            action: 'streamChanged',
            newStream: stream,
            oldStream: this.localStream
          };
          sub.notify(message);
        });
      } catch (e) {
        this.handleStream(e, stream);
      }
    }
  }

  private attachLocalStream(stream: MediaStream) {
    this.logger.log('Local stream has been attached');
    if (stream) {
      this.localStream = stream;
      this.audioProcessor = createMicrophoneLevelVoice(stream, this.processAudio.bind(this));
      let payload: StringIdentifier = {
        id: this.roomId,
        state: URL.createObjectURL(stream)
      };
      this.store.commit('setLocalStreamSrc', payload);
    }
    this.setCallIconsState();
  }

  getTrack (kind: VideoType) {
    let track = null;
    let tracks = [];
    if (this.localStream) {
      if (kind === VideoType.VIDEO || kind === VideoType.SHARE) {
        tracks = this.localStream.getVideoTracks();
      } else if (kind === VideoType.AUDIO) {
        tracks = this.localStream.getAudioTracks();
      } else {
        throw 'invalid track name';
      }
      if (tracks.length > 0) {
        let isShare = tracks[0].isShare;
        if (isShare && kind === VideoType.SHARE) {
          track = tracks[0];
        } else if (!isShare && kind === VideoType.VIDEO) {
          track = tracks[0];
        } else if (kind === VideoType.AUDIO) {
          track = tracks[0];
        }
      }
    }
    return track;
  }


  // setAudio(value) {
  //   let audioTrack = this.getTrack('audio');
  //   if (!audioTrack) {
  //     let payload: BooleanIdentifier = {
  //       id: this.roomId,
  //       state: false,
  //     };
  //     this.store.commit('setMicToState', payload);
  //   }
  // }


  setCallIconsState  () {
    // if (this.callInfo.showMic) {
    //   let audioTrack = this.getTrack('audio');
    //   if (!audioTrack) {
    //     let payload: BooleanIdentifier = {
    //       id: this.roomId,
    //       state: false,
    //     }
    //     this.store.commit('setMicToState', payload);
    //   }
    // }
    // let videoTrack = this.getTrack('video');
    // if (this.)
    // this.setVideo(videoTrack && videoTrack.enabled);
    // this.setAudio(audioTrack && audioTrack.enabled);
    // this.setDesktopCapture(this.getTrack('share') != null);
    // this.autoSetLocalVideoVisibility();
  }

  async offerCall() {
    let stream;
    try {
      stream = await this.captureInput();
      this.logger.log('got local stream {}', stream)();
      if (stream) {
        this.attachLocalStream(stream);
      }
      let payload: BooleanIdentifier = {
        state: true,
        id: this.roomId,
      };
      this.setCallStatus('sent_offer');
      this.store.commit('setCallActiveToState', payload);
      this.wsHandler.offerCall(this.roomId, browserVersion, (e: WebRtcSetConnectionIdMessage) => {
        if (e.connId) {
          this.connectionId = e.connId;
          sub.subscribe(Subscription.getTransferId(e.connId), this);
        }
      });
    } catch (e) {
      this.handleStream(e, stream);
    }
  }


  createCallPeerConnection(message: ReplyCallMessage) {
    if (message.opponentWsId > this.wsHandler.getWsConnectionId()) {
      new CallSenderPeerConnection(this.roomId, this.connectionId, message.opponentWsId,  message.userId,  this.wsHandler, this.store);
    }  else {
      new CallReceiverPeerConnection(this.roomId, this.connectionId, message.opponentWsId, message.userId, this.wsHandler, this.store);
    }
    this.webrtcConnnectionsIds.push(message.opponentWsId);
  }

  replyCall(message: ReplyCallMessage) {
    this.createCallPeerConnection(message);
  }

  initAndDisplayOffer(message: OfferCall) {
    this.setCallStatus('received_offer');
    if (this.connectionId) {
      this.logger.error('Old connId still exists {}', this.connectionId)();
    }
    this.connectionId = message.connId;
    sub.subscribe(Subscription.getTransferId(message.connId), this);
    this.logger.log('CallHandler initialized')();
    this.wsHandler.replyCall(message.connId, browserVersion);
    let payload2: IncomingCallModel = {
      connId: message.connId,
      roomId: message.roomId,
      userId: message.userId
    };
    this.acceptedPeers.push(message.opponentWsId);
    this.store.commit('setIncomingCall', payload2);
    this.createCallPeerConnection(message);
  }

  answerCall() {
    this.doAnswer(false);
  }

  async doAnswer(withVideo: boolean) {
    let trueBoolean: BooleanIdentifier = {
      state: true,
      id: this.roomId,
    };
    let falseBoolean: BooleanIdentifier = {
      state: false,
      id: this.roomId,
    }
    this.store.commit('setIncomingCall', null);
    this.store.commit('setCallActiveToState', trueBoolean);
    this.store.commit('setContainerToState', trueBoolean);
    this.store.commit('setVideoToState', withVideo ? trueBoolean : falseBoolean);
    this.store.commit('setMicToState', trueBoolean);
    this.setCallStatus('accepted');
    let stream = await this.captureInput();
    this.attachLocalStream(stream);
    this.wsHandler.acceptCall(this.connectionId);
    this.acceptedPeers.forEach( (e) => {
      let message: ConnectToRemoteMessage = {
        action: 'connectToRemote',
        stream: this.localStream,
        handler: Subscription.getPeerConnectionId(this.connectionId, e)
      };
      sub.notify(message);
    });
    router.replace(`/chat/${this.roomId}`);
  }

  videoAnswerCall() {
    this.doAnswer(true);
  }

  destroyAudioProcessor() {
    if (this.audioProcessor && this.audioProcessor.javascriptNode && this.audioProcessor.javascriptNode.onaudioprocess) {
      this.logger.debug('Removing local audioproc')();
      this.audioProcessor.javascriptNode.onaudioprocess = null;
    }
  }

  stopLocalStream () {
    this.destroyAudioProcessor();
    this.destroyStreamData(this.localStream);
  }

  onDestroy() {
    this.stopLocalStream();
    let payload2: StringIdentifier = {
      id: this.roomId,
      state: null
    };
    this.store.commit('setLocalStreamSrc', payload2);
    this.connectionId = null;
    let payload: BooleanIdentifier = {
      state: false,
      id: this.roomId,
    };
    this.store.commit('setCallActiveToState', payload);
  }

  declineCall() {
    this.store.commit('setIncomingCall', null);
    this.wsHandler.declineCall(this.connectionId);
    this.onDestroy();
  }

  hangCall() {
    this.logger.debug('on hangCall called')();
    let hadConnections = this.webrtcConnnectionsIds.length >= 0;
    if (hadConnections) {
      this.closeAllPeerConnections();
    } else {
      this.onDestroy();
    }
  }

  private setCallStatus(status: string) {
    this.logger.log("Setting call status to {}", status)();
    this.callStatus = status;
  }
}