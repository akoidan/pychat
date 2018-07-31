import ChatCall from '../assets/sounds/Call.mp3';
import ChatIncoming from '../assets/sounds/ChatIncoming.wav';
import ChatLogin from '../assets/sounds/ChatLogin.wav';
import ChatLogout from '../assets/sounds/ChatLogout.wav';
import ChatOutgoing from '../assets/sounds/ChatOutgoing.wav';
import ChatFile from '../assets/sounds/File.mp3';
import {globalLogger, notifier} from './singletons';

export const call = new Audio(<any>ChatCall);
export const incoming = new Audio(<any>ChatIncoming);
export const login = new Audio(<any>ChatLogin);
export const logout = new Audio(<any>ChatLogout);
export const outgoing = new Audio(<any>ChatOutgoing);
export const file = new Audio(<any>ChatFile);


export  function checkAndPlay(element, volume) {
  if (volume && notifier.isTabMain()) {
    try {
      element.pause();
      element.currentTime = 0;
      element.volume = volume * volume / 10_000;
      let prom = element.play();
      prom && prom.catch(function (e) {
      });
    } catch (e) {
      globalLogger.error('Skipping playing message, because {}', e)();
    }
  }
}
