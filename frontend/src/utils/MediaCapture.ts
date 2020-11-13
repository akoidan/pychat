import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';
import {stopVideo} from '@/utils/htmlApi';
import {permissions_type, PlatformUtil} from '@/types/model';

export default class MediaCapture {
  private readonly isRecordingVideo: boolean;
  private mediaRecorder: MediaRecorder|null = null;
  private timeout: number | null = null;
  // private stopped: boolean = false;
  private readonly platformUtil: PlatformUtil;

  private readonly logger: Logger = loggerFactory.getLoggerColor('nav-record', 'brown');
  private readonly recordedBlobs: any[] = [];
  private stream: MediaStream|null = null;

  constructor(isRecordingVideo: boolean, platformUtil: PlatformUtil) {
    this.isRecordingVideo = isRecordingVideo;
    this.platformUtil = platformUtil;
  }

  public async record(): Promise<MediaStream|null> {
    const requiredPerms : permissions_type = this.isRecordingVideo ? ['audio', 'video'] : ['audio'];
    await this.platformUtil.askPermissions(...requiredPerms);
    this.logger.debug("Capturing media")();
    this.stream = await navigator.mediaDevices.getUserMedia({video: this.isRecordingVideo, audio: true});
    this.logger.debug('Permissions are granted')();
    // await new Promise(resolve => {
    //   this.timeout = window.setTimeout(resolve, 2500); // wait until videocam opens
    //   // this thing allows to skip 0.5second of black video,
    //   // and preview of file would be of real video instead of black
    //   // to find out what it means, capture video and send it to chat.
    //   // until you hit played, you should see image preview which should not be black
    //   // I COmmented this because it doesn't work anyway
    // });
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
    // this.timeout = null;
    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    this.mediaRecorder.start(10); // collect 10ms of data
    this.logger.debug('MediaRecorder started {}', this.mediaRecorder)();

    return this.stream;
  }

  public async stopRecording(): Promise<Blob|null> {
    // this.stopped = true;
    // if (this.timeout) {
    //   clearTimeout(this.timeout);
    //   this.timeout = null;
    // } else
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = (event: Event) => {
          this.logger.debug('Recorder stopped: {}', event)();
          stopVideo(this.stream);
          if (this.recordedBlobs.length === 1) {
            resolve(this.recordedBlobs[0]);
          } else if (this.recordedBlobs.length > 1) {
            const blob: Blob = new Blob(this.recordedBlobs, {
              type: this.recordedBlobs[0].type
            });
            this.logger.debug(
                'Assembled blobs {} into {}',
                this.recordedBlobs,
                blob
            )();
            resolve(blob);
          } else {
            resolve(null);
          }
        };
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  private handleDataAvailable(event: MediaRecorderDataAvailableEvent) {
    if (event.data && event.data.size > 0) {
      this.logger.trace('Appending blob: {}', event.data)();
      this.recordedBlobs.push(event.data);
    }
  }
}
