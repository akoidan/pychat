import {JsAudioAnalyzer} from '@/types/types';
import {extractError} from '@/utils/utils';
import {globalLogger, isMobile} from '@/utils/singletons';
import {IS_DEBUG} from '@/utils/consts';

let audioContext: AudioContext;
const audioProcesssors: JsAudioAnalyzer[] = [];
if (IS_DEBUG) {
  window.audioProcesssors = audioProcesssors;
}

export function createMicrophoneLevelVoice (
    stream: MediaStream,
    onaudioprocess: (e: JsAudioAnalyzer) => (e: AudioProcessingEvent) => void
): JsAudioAnalyzer|null {
  try {
    if (isMobile) {
      globalLogger.log('Current phone is mobile, audio processor won\'t be created')();

      return null;
    }
    const audioTracks: MediaStreamTrack[] = stream && stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw Error('Stream has no audio tracks');
    }
    const audioTrack: MediaStreamTrack = audioTracks[0];
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const javascriptNode = audioContext.createScriptProcessor(4096, 1, 1);
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    const prevVolumeValues = 0;
    const volumeValuesCount = 0;
    const res: JsAudioAnalyzer = {
      analyser,
      javascriptNode,
      prevVolumeValues,
      volumeValuesCount
    };
    javascriptNode.onaudioprocess = onaudioprocess(res);
    audioProcesssors.push(res);
    globalLogger.log('Created new audioProcessor')();

    return res;
  } catch (err) {
    globalLogger.error('Unable to use microphone level because {}', extractError(err))();

    return null;
  }
}

export function getAverageAudioLevel (audioProc: JsAudioAnalyzer) {
  const array = new Uint8Array(audioProc.analyser.frequencyBinCount);
  audioProc.analyser.getByteFrequencyData(array);
  let values = 0;
  const length = array.length;
  for (let i = 0; i < length; i++) {
    values += array[i];
  }

  return values / length;
}
