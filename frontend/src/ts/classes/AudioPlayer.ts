import NotifierHandler from '@/ts/classes/NotificationHandler';
import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';


export class AudioPlayer {
  private readonly notifier: NotifierHandler;
  private readonly logger: Logger;

  constructor(notifier: NotifierHandler) {
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('audio');
  }

  checkAndPlay(element: HTMLAudioElement, volume: number) {
    if (volume && this.notifier.isTabMain()) {
      try {
        element.pause();
        element.currentTime = 0;
        element.volume = volume * volume / 10_000;
        const prom = element.play();
        prom && prom.catch(function (e) {
        });
      } catch (e) {
        this.logger.error('Skipping playing message, because {}', e)();
      }
    }
  }
}


