import {globalLogger} from './singletons';
import hljs from 'highlightjs';

const yotubeTimeRegex = /(?:(\d*)h)?(?:(\d*)m)?(?:(\d*)s)?(\d)?/;
export function pasteHtmlAtCaret(html: string, div: HTMLTextAreaElement) {
  div.focus();
  let divOuter = document.createElement('div');
  divOuter.innerHTML = html;
  let img = divOuter.firstChild;
  let sel = window.getSelection();
  let range = sel.getRangeAt(0);
  range.deleteContents();
  // Range.createContextualFragment() would be useful here but is
  // non-standard and not supported in all browsers (IE9, for one)
  let frag = document.createDocumentFragment();
  frag.appendChild(img);
  range.insertNode(frag);
  // Preserve the selection
  range = range.cloneRange();
  range.setStartAfter(img);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}


export  function setVideoEvent(e: HTMLElement) {
  let r = e.querySelectorAll('.video-player');
  for (let i = 0; i < r.length; i++) {
    (function (e) {
      let querySelector: HTMLElement = e.querySelector('.icon-youtube-play');
      let url = e.getAttribute('associatedVideo');
      globalLogger.debug('Embedding video url {}', url)();
      querySelector.onclick = function (event) {
        let video = document.createElement('video');
        video.setAttribute('controls', '');
        video.className = 'video-player-ready';
        globalLogger.debug('Replacing video url {}', url)();
        video.src = url;
        e.parentNode.replaceChild(video, e);
        video.play();
      };
    })(r[i]);
  }
}


function getTime(time: string): number {
  let start = 0;
  if (time) {
    let res = yotubeTimeRegex.exec(time);
    if (res) {
      if (res[1]) {
        start += parseInt(res[1]) * 3600;
      }
      if (res[2]) {
        start += parseInt(res[2]) * 60;
      }
      if (res[3]) {
        start += parseInt(res[3]);
      }
      if (res[4]) {
        start += parseInt(res[4]);
      }
    }
  }
  return start;
}

export function setYoutubeEvent(e) {
    let r = e.querySelectorAll('.youtube-player');
    for (let i = 0; i < r.length; i++) {
      let querySelector = r[i].querySelector('.icon-youtube-play');
      let id = r[i].getAttribute('data-id');
      globalLogger.debug('Embedding youtube view {}', id)();
      querySelector.onclick = (function (e) {
        return function (event) {
          let iframe = document.createElement('iframe');
          let time: string = getTime(e.getAttribute('data-time')).toString();
          if (time) {
            time = '&start=' + time;
          } else {
            time = '';
          }
          let src = `https://www.youtube.com/embed/${id}?autoplay=1${time}`;
          iframe.setAttribute('src', src);
          iframe.setAttribute('frameborder', '0');
          iframe.className = 'video-player-ready';
          globalLogger.log('Replacing youtube url {}', src)();
          iframe.setAttribute('allowfullscreen', '1');
          e.parentNode.replaceChild(iframe, e);
        };
      })(r[i]);
    }
}

export  function highlightCode(element) {
  let s = element.querySelectorAll('pre');
  for (let i = 0; i < s.length; i++) {
    hljs.highlightBlock(s[i]);
  }
}


export const Utils = {
  videoFiles: {},
  previewFiles: {},
  imagesFiles: {}
};