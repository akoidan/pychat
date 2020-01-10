import loggerFactory from "@/utils/loggerFactory";
import {Logger} from "lines-logger";
import {stopVideo} from "@/utils/htmlApi";

export default class MediaCapture {
  private readonly isRecordingVideo: boolean;

  private readonly onFinish: Function;

  private mediaRecorder: MediaRecorder|null = null;

  private timeout: number | null = null;

  private stopped: boolean = false;

  private readonly logger: Logger = loggerFactory.getLoggerColor("nav-record", "brown");

  private readonly recordedBlobs: any[] = [];

  private stream: MediaStream|null = null;

  constructor(isRecordingVideo: boolean, onFinish: Function) {
    this.isRecordingVideo = isRecordingVideo;
    this.onFinish = onFinish;
  }

  public async record(): Promise<MediaStream|null> {
    this.stream = await new Promise<MediaStream>((resolve, reject) => {
      navigator.getUserMedia({video: this.isRecordingVideo,
        audio: true}, resolve, reject);
    });
    this.logger.debug("Permissions are granted")();
    await new Promise((resolve) => {
      this.timeout = window.setTimeout(resolve, 500); // Wait until videocam opens
    });
    if (this.stopped) {
      return null;
    }
    let options = {mimeType: "video/webm;codecs=vp9"};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      this.logger.debug("{} is not Supported", options.mimeType)();
      options = {mimeType: "video/webm;codecs=vp8"};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        this.logger.debug("{} is not Supported", options.mimeType)();
        options = {mimeType: "video/webm"};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          this.logger.debug("{} is not Supported", options.mimeType)();
          options = {mimeType: ""};
        }
      }
    }
    this.timeout = null;
    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.onstop = this.handleStop.bind(this);
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    this.mediaRecorder.start(10); // Collect 10ms of data
    this.logger.debug("MediaRecorder started {}", this.mediaRecorder)();

    return this.stream;
  }

  public stopRecording() {
    this.stopped = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    } else if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    } else {
      this.onFinish(null);
    }
  }

  private handleStop(event: Event) {
    this.logger.debug("Recorder stopped: {}", event)();
    stopVideo(this.stream);
    if (this.recordedBlobs.length === 1) {
      this.onFinish(this.recordedBlobs[0]);
    } else if (this.recordedBlobs.length > 1) {
      const blob: Blob = new Blob(this.recordedBlobs, {type: this.recordedBlobs[0].type});
      this.logger.debug("Assembled blobs {} into {}", this.recordedBlobs, blob)();
      this.onFinish(blob);
    } else {
      this.onFinish(null);
    }
  }

  private handleDataAvailable(event: MediaRecorderDataAvailableEvent) {
    if (event.data && event.data.size > 0) {
      this.logger.debug("Appending blob: {}", event.data)();
      this.recordedBlobs.push(event.data);
    }
  }
}
