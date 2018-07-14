import loggerFactory from './loggerFactory';
import {Logger} from 'lines-logger';
import {stopVideo} from './htmlApi';

declare class MediaRecorder {
  constructor(stream: MediaStream, options: {});
  static isTypeSupported(t: string): boolean;
  onstop: Function;
  stop();
  ondataavailable: Function;
  start(time?: number );
}

export default class MediaCapture {
  private isRecordingVideo: boolean;
  private onFinish: Function;
  private mediaRecorder: MediaRecorder;
  private timeout: number;
  private stopped: boolean = false;

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
    this.logger.debug('Permissions are granted')();
    await new Promise(resolve => {
      this.timeout = setTimeout(resolve, 500); // wait until videocam opens
    });
    if (this.stopped) {
      return;
    }
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
    this.timeout = null;
    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.onstop = this.handleStop.bind(this);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    this.mediaRecorder.start(10); // collect 10ms of data
    this.logger.debug('MediaRecorder started {}', this.mediaRecorder)();
    return URL.createObjectURL(this.stream);
  }

  public stopRecording() {
    this.stopped = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    } else if ( this.mediaRecorder) {
      this.mediaRecorder.stop();
    } else {
      this.onFinish(null);
    }
  }

  private handleStop(event) {
    this.logger.debug('Recorder stopped: {}', event)();
    stopVideo(this.stream);
    if (this.recordedBlobs.length === 1) {
      this.onFinish(this.recordedBlobs[0]);
    } else if (this.recordedBlobs.length > 1) {
      let blob: Blob = new Blob(this.recordedBlobs, {type: this.recordedBlobs[0].type});
      this.logger.debug('Assembled blobs {} into {}', this.recordedBlobs, blob)();
      this.onFinish(blob);
    } else {
      this.onFinish(null);
    }
  }

  private handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.logger.debug('Appending blob: {}', event.data)();
      this.recordedBlobs.push(event.data);
    }
  }
}