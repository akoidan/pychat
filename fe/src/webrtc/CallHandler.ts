import BaseTransferHandler from './BaseTransferHandler';
import {DefaultMessage, WebRtcSetConnectionIdMessage} from '../types/messages';
import {browserVersion, isChrome, isMobile} from '../utils/singletons';
import {sub} from '../utils/sub';
import Subscription from '../utils/Subscription';
import {CallsInfoModel} from '../types/model';
import {BooleanIdentifier, JsAudioAnalyzer, NumberIdentifier, SetDevices} from '../types/types';
import {CHROME_EXTENSION_ID, CHROME_EXTENSION_URL} from '../utils/consts';
import { extractError, forEach} from '../utils/utils';
import {createMicrophoneLevelVoice, getAverageAudioLevel} from '../utils/audioprocc';

export default class CallHandler extends BaseTransferHandler {
  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {

  };
  private localStream: MediaStream;
  private audioProcessor: JsAudioAnalyzer;

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
    if (this.callInfo.showMic || this.callInfo.showVideo) {
      let audio: any = this.callInfo.showMic;
      if (this.callInfo.currentMic && audio) {
        audio = {deviceId: this.callInfo.currentMic};
      }
      let video: any = this.callInfo.showVideo; // convert null to bolean, if we pass null to getUserMedia it tries to capture
      if (this.callInfo.currentWebcam && video) {
        video = {deviceId: this.callInfo.currentWebcam};
      }
      let endStream = await navigator.mediaDevices.getUserMedia({audio, video});
      if (navigator.mediaDevices.enumerateDevices) {
        let devices = await navigator.mediaDevices.enumerateDevices();
        this.inflateDevices(devices);
      }
    }
    if (this.callInfo.shareScreen) {
      let share = await this.getDesktopShareFromExtension();
      this.logger.log('Resolving userMedia from dekstopShare')();
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
      let value = getAverageAudioLevel(audioProc);
      audioProc.prevVolumeValues += value;
      audioProc.volumeValuesCount++;
      if (audioProc.volumeValuesCount === 100 && audioProc.prevVolumeValues === 0) {
        let url = isChrome ? 'setting in chrome://settings/content' : 'your browser settings';
        url += navigator.platform.indexOf('Linux') >= 0 ?
            '. Open pavucontrol for more info' :
            ' . Right click on volume icon in system tray -> record devices -> input -> microphone';
        this.store.dispatch('growlError', `Unable to capture input from microphone. Check your microphone connection or ${url}`);
      }

      let payload: NumberIdentifier = {
        id: this.roomId,
        state: Math.sqrt(value),
      };
      this.store.commit('setCurrentMicLevel', payload);
    };
  }

  private attachLocalStream(stream: MediaStream) {
    if (stream) {
      this.logger.log('Local stream has been attached')();
      this.localStream = stream;
      this.audioProcessor = createMicrophoneLevelVoice(stream, this.processAudio);
    }
    this.setCallIconsState();
  }

  getTrack (kind) {
    let track = null;
    let tracks = [];
    if (this.localStream) {
      if (kind === 'video' || kind === 'share') {
        tracks = this.localStream.getVideoTracks();
      } else if (kind === 'audio') {
        tracks = this.localStream.getAudioTracks();
      } else {
        throw 'invalid track name';
      }
      if (tracks.length > 0) {
        let isShare = tracks[0].isShare;
        if (isShare && kind === 'share') {
          track = tracks[0];
        } else if (!isShare && kind === 'video') {
          track = tracks[0]
        } else if (kind === 'audio') {
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
      if (stream) {
        this.attachLocalStream(stream);
      }
      this.wsHandler.offerCall(this.roomId, browserVersion, (e: WebRtcSetConnectionIdMessage) => {
        if (e.connId) {
          this.connectionId = e.connId;
          let payload: BooleanIdentifier = {
            state: true,
            id: this.roomId,
          };
          this.store.commit('setCallActiveToState', payload);
          sub.subscribe(Subscription.getTransferId(e.connId), this);
        }
      });
    } catch (e) {
      this.handleStream(e, stream);
    }
  }
}