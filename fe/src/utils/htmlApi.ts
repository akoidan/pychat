import {globalLogger} from './singletons';
import smileys from '../assets/smileys/info.json';

import {API_URL_DEFAULT, PASTED_IMG_CLASS} from './consts';
import {MessageDataEncode, SmileyStructure, UploadFile} from '../types/types';
import {MessageModel} from '../types/model';

const tmpCanvasContext = document.createElement('canvas').getContext('2d');
const yotubeTimeRegex = /(?:(\d*)h)?(?:(\d*)m)?(?:(\d*)s)?(\d)?/;
const smileysTabNames = Object.keys(smileys);
let codes = {};
smileysTabNames.forEach(tb => {
  codes = {...smileys[tb], ...codes};
});
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '\n': '<br>',
  '/': '&#x2F;'
};


const smileUnicodeRegex = /[\u3400-\u3500]/g;
const imageUnicodeRegex = /[\u3501-\u3600]/g;
const patterns = [
  {
    search: /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|$))/g, /*http://anycharacter except end of text, <br> or space*/
    replace: '<a href="$1" target="_blank">$1</a>',
    name: 'links'
  }, {
    search: /<a href="http(?:s?):&#x2F;&#x2F;(?:www\.)?youtu(?:be\.com&#x2F;watch\?v=|\.be\/)([\w\-\_]*)(?:[^"]*?\&amp\;t=([\w\-\_]*))?[^"]*" target="_blank">[^<]+<\/a>/g,
    replace: '<div class="youtube-player" data-id="$1" data-time="$2"><div><img src="https://i.ytimg.com/vi/$1/hqdefault.jpg"><div class="icon-youtube-play"></div></div></div>',
    name: 'youtube'
  },
  {
    search: /```(.+?)(?=```)```/g,
    replace: '<pre>$1</pre>',
    name: 'code'
  },
  {
    search: /(^\(\d\d:\d\d:\d\d\)\s[a-zA-Z-_0-9]{1,16}:)(.*)&gt;&gt;&gt;<br>/,
    replace: '<div class="quote"><span>$1</span>$2</div>',
    name: 'quote'
  }
];



const replaceHtmlRegex = new RegExp('[' + Object.keys(escapeMap).join('') + ']', 'g');

export function encodeHTML(html: string) {
  return html.replace(replaceHtmlRegex, s => escapeMap[s]);
}

export function getSmileyPath(s: SmileyStructure) {
  return `/${s.src}`;
}
let uniqueId = 1;
export function getUniqueId() {
  return uniqueId++;
}

export function getSmileyHtml (symbol: string) {
  let smiley = codes[symbol];
  return `<img src="${getSmileyPath(smiley)}" symbol="${symbol}" alt="${smiley.alt}">`;
}

export const isDateMissing = (function() {
  let input = document.createElement('input');
  input.setAttribute('type', 'date');
  let notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);
  return input.value === notADateValue;
})();


export function resolveUrl(src: string): string {
  return `${API_URL_DEFAULT}${src}`;
}

export function encodeSmileys(html: string): string {
  return html.replace(smileUnicodeRegex, c => getSmileyHtml(c));
}

export function encodeP(data: MessageModel) {
  let html = encodeHTML(data.content);
  html = encodeFiles(html, data.files);
  return encodeSmileys(html);
}

export const canvasContext: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d');

export function encodeMessage(data: MessageModel) {
  globalLogger.debug('Encoding message {}: {}', data.id, data)();
  if (data.giphy) {
    return `<div class="giphy"><img src='${resolveUrl(data.giphy)}' /><a class="giphy_hover" href="https://giphy.com/" target="_blank"/></div>`;
  } else {
    let html = encodeHTML(data.content);
    let replaceElements = [];
    patterns.forEach( (pattern) => {
      let res = html.replace(pattern.search, pattern.replace);
      if (res !== html) {
        replaceElements.push(pattern.name);
        html = res;
      }
    });
    if (replaceElements.length) {
      globalLogger.debug('Replaced {} in message #{}', replaceElements.join(', '), data.id)();
    }
    html = encodeFiles(html, data.files);
    return encodeSmileys(html);
  }
}

function encodeFiles(html, files) {
  if (files && Object.keys(files).length) {
    html = html.replace(imageUnicodeRegex,  (s) => {
      let v = files[s];
      if (v) {
        if (v.type === 'i') {
          return `<img src='${resolveUrl(v.url)}' imageId='${v.id}' symbol='${s}' class='${PASTED_IMG_CLASS}'/>`;
        } else if (v.type === 'v') {
          return `<div class='video-player' associatedVideo='${v.url}'><div><img src='${resolveUrl(v.preview)}' symbol='${s}' imageId='${v.id}' class='${PASTED_IMG_CLASS}'/><div class="icon-youtube-play"></div></div></div>`;
        } else {
          globalLogger.error('Invalid type {}', v.type)();
        }
      }
      return s;
    });
  }
  return html;
}




export function pasteNodeAtCaret(img: Node, div: HTMLTextAreaElement) {
  div.focus();
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


export function pasteHtmlAtCaret(html: string, div: HTMLTextAreaElement) {
  let divOuter = document.createElement('div');
  divOuter.innerHTML = html;
  let img = divOuter.firstChild;
  pasteNodeAtCaret(img, div);
}


export function setVideoEvent(e: HTMLElement) {
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
        video.src = resolveUrl(url);
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

export function setYoutubeEvent(e: HTMLElement) {
  let r = e.querySelectorAll('.youtube-player');
  for (let i = 0; i < r.length; i++) {
    let querySelector: HTMLElement = r[i].querySelector('.icon-youtube-play');
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


function setBlobName(blob: Blob) {
  if (!blob['name'] && blob.type.indexOf('/') > 1) {
    blob['name'] = '.' + blob.type.split('/')[1];
  }
}

function pasteBlobImgToTextArea(blob: Blob, textArea: HTMLTextAreaElement) {
  let img = document.createElement('img');
  img.className = PASTED_IMG_CLASS;
  let src = URL.createObjectURL(blob);
  img.src = src;
  setBlobName(blob);
  Utils.imagesFiles[src] = blob;
  pasteNodeAtCaret(img, textArea);
  return img;
}

function pasteBlobVideoToTextArea(file: File, textArea: HTMLTextAreaElement, errCb: Function) {
  let video = document.createElement('video');
  if (video.canPlayType(file.type)) {
    video.autoplay = false;
    let src = URL.createObjectURL(file);
    video.loop = false;
    video.addEventListener('loadeddata', function () {
      tmpCanvasContext.canvas.width = video.videoWidth;
      tmpCanvasContext.canvas.height = video.videoHeight;
      tmpCanvasContext.drawImage(video, 0, 0);
      tmpCanvasContext.canvas.toBlob(function (blob) {
        let url = URL.createObjectURL(blob);
        let img = document.createElement('img');
        img.className = PASTED_IMG_CLASS;
        img.src = url;
        blob['name'] = '.jpg';
        img.setAttribute('associatedVideo', src);
        Utils.videoFiles[src] = file;
        Utils.previewFiles[url] = blob;
        pasteNodeAtCaret(img, textArea);
      }, 'image/jpeg', 0.95);
    }, false);
    video.src = src;
  } else {
    errCb(`Browser doesn't support playing ${file.type}`);
  }
}


export function pasteImgToTextArea(file: File, textArea: HTMLTextAreaElement, errCb: Function) {
  if (file.type.indexOf('image') >= 0) {
    pasteBlobImgToTextArea(file, textArea);
  } else if (file.type.indexOf('video') >= 0) {
    pasteBlobVideoToTextArea(file, textArea, errCb);
  } else {
    errCb(`Pasted file type ${file.type}, which is not an image`);
  }
}

export function highlightCode(element) {
  let s = element.querySelectorAll('pre');
  globalLogger.debug('hightlightning code')();
  if (s.length) {
    import( /* webpackChunkName: "highlightjs" */ 'highlightjs').then(hljs => {
      for (let i = 0; i < s.length; i++) {
        hljs.highlightBlock(s[i]);
      }
    });
  }
}


function nextChar(c: string): string {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}


export function getMessageData (currSymbol: string, userMessage: HTMLTextAreaElement): MessageDataEncode {
  let files: UploadFile[] = []; // return array from nodeList
  let images = userMessage.querySelectorAll('.' + PASTED_IMG_CLASS);
  for (let i = 0; i < images.length; i++) {
    let img = images[i];
    let elSymbol = img.getAttribute('symbol');
    if (!elSymbol) {
      currSymbol = nextChar(currSymbol);
      elSymbol = currSymbol;
    }
    let textNode = document.createTextNode(elSymbol);
    img.parentNode.replaceChild(textNode, img);
    if (!img.getAttribute('symbol')) { // don't send image again, it's already in server
      let assVideo = img.getAttribute('associatedVideo');
      if (assVideo) {
        files.push({
          file: Utils.videoFiles[assVideo],
          type: 'v',
          symbol:  elSymbol
        });
        files.push({
          file: Utils.previewFiles[img.getAttribute('src')],
          type: 'p',
          symbol:  elSymbol
        });
      } else {
        files.push({
          file: Utils.imagesFiles[img.getAttribute('src')],
          type: 'i',
          symbol:  elSymbol
        });
      }
    }
  }
  let urls = [Utils.imagesFiles, Utils.videoFiles, Utils.previewFiles];
  urls.forEach((url) => {
    for (let k in url) {
      globalLogger.log('Revoking url {}', k)();
      URL.revokeObjectURL(k);
      delete urls[k];
    }
  });
  userMessage.innerHTML = userMessage.innerHTML.replace(/<img[^>]*symbol="([^"]+)"[^>]*>/g, '$1');
  let messageContent: string = typeof userMessage.innerText !== 'undefined' ? userMessage.innerText : userMessage.textContent;
  messageContent = /^\s*$/.test(messageContent) ? null : messageContent;
  userMessage.innerHTML = '';
  return {files, messageContent};
}

export const Utils = {
  videoFiles: {},
  previewFiles: {},
  imagesFiles: {}
};