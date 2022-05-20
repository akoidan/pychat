import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type {MainWindow} from "@/ts/classes/MainWindow";


export class AudioPlayer {
  private readonly mainWindow: MainWindow;

  private readonly logger: Logger;

  public constructor(mainWindow: MainWindow) {
    this.mainWindow = mainWindow;
    this.logger = loggerFactory.getLogger("audio");
  }

  checkAndPlay(element: HTMLAudioElement, volume: number) {
    if (volume && this.mainWindow.isTabMain()) {
      try {
        element.pause();
        element.currentTime = 0;
        element.volume = volume * volume / 10_000;
        const prom = element.play();
        prom && prom.catch((e) => {
        });
      } catch (e) {
        this.logger.error("Skipping playing message, because {}", e)();
      }
    }
  }
}


