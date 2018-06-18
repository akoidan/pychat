import {globalLogger} from './singletons';
import smileys from '../assets/smileys/info.json';
import {MessageModel, SmileyStructure} from '../types';
import {PASTED_IMG_CLASS} from './consts';

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

function encodeHTML(html: string) {
  return html.replace(replaceHtmlRegex, s => escapeMap[s]);
}

export function getSmileyPath(s: SmileyStructure) {
  return `/${s.src}`;
}

export function getSmileyHtml (code: string) {
  let smiley = codes[code];
  return `<img src="${getSmileyPath(smiley)}" code="${code}" alt="${smiley.alt}">`;
}

export function encodeSmileys(html) {
  return html.replace(smileUnicodeRegex, c => getSmileyHtml(c));
}

export function encodeMessage(data: MessageModel) {
  globalLogger.debug('Encoding message {}', data)();
  if (data.giphy) {
    return `<div class="giphy"><img src='${data.giphy}' /><a class="giphy_hover" href="https://giphy.com/" target="_blank"/></div>`;
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
          return `<img src='${v.url}' imageId='${v.id}' symbol='${s}' class='${PASTED_IMG_CLASS}'/>`;
        } else if (v.type === 'v') {
          return `<div class='video-player' associatedVideo='${v.url}'><div><img src='${v.preview}' symbol='${s}' imageId='${v.id}' class='${PASTED_IMG_CLASS}'/><div class="icon-youtube-play"></div></div></div>`;
        } else {
          globalLogger.error('Invalid type {}', v.type)();
        }
      }
      return s;
    });
  }
  return html;
}

