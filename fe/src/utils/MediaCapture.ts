import {globalLogger} from './singletons';
import loggerFactory from './loggerFactory';
import {Logger} from 'lines-logger';
import {stopVideo} from './htmlApi';

declare class MediaRecorder {
  constructor(stream: MediaStream, options: {});
  static isTypeSupported(t: string): boolean;
  onstop: Function;
  stop();
  ondataavailable: Function;
  start(time: number);
}

export default class MediaCapture {
  private isRecordingVideo: boolean;
  private onFinish: Function;
  private mediaRecorder: MediaRecorder;

  constructor(isRecordingVideo: boolean, onFinish: Function) {
    this.isRecordingVideo = isRecordingVideo;
    this.onFinish = onFinish;
  }

  private logger: Logger = loggerFactory.getLoggerColor('nav-record', 'brown');
  private recordedBlobs: any[] = [];
  private stream: MediaStream;

  public async record(): Promise<string> {

    this.stream = await new Promise<MediaStream>((resolve, reject) => {
      navigator.getUserMedia({video: this.isRecordingVideo, audio: true}, resolve, reject);
    });
    let options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      this.logger.debug('{} is not Supported', options.mimeType)();
      options = {mimeType: 'video/webm;codecs=vp8'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        this.logger.debug('{} is not Supported', options.mimeType)();
        options = {mimeType: 'video/webm'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          this.logger.debug('{} is not Supported', options.mimeType)();
          options = {mimeType: ''};
        }
      }
    }
    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.onstop = this.handleStop.bind(this);
    this.mediaRecorder.ondataavailable = this.handleStop.bind(this);
    this.mediaRecorder.start(10); // collect 10ms of data
    this.logger.debug('MediaRecorder started {}', this.mediaRecorder)();
    return URL.createObjectURL(this.stream);
  }

  public stopRecording() {
    this.mediaRecorder.stop();
  }

  private handleStop(event) {
    this.logger.debug('Recorder stopped: {}', event)();
    stopVideo(this.stream);
    this.onFinish(this.recordedBlobs);
  }

  private handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.logger.debug('Appending blob: {}', event.data)();
      this.recordedBlobs.push(event.data);
    }
  }
}