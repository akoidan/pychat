import {ImageType} from "@common/model/enum/image.type";
import {IS_DEBUG, PASTED_GIPHY_CLASS, PASTED_IMG_CLASS, USERNAME_REGEX} from "@/ts/utils/consts";
import type {MessageDataEncode} from "@/ts/types/types";
import type {CurrentUserSettingsModel, FileModel, MessageModel, UserModel} from "@/ts/types/model";
import recordIcon from "@/assets/img/audio.svg";
import fileIcon from "@/assets/img/file.svg";
import {getFlag} from "@/ts/utils/flags";
import videoIcon from "@/assets/img/icon-play-red.svg";
import type {SmileysApi} from "@/ts/utils/smileys";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import {MEDIA_API_URL, webpSupported} from "@/ts/utils/runtimeConsts";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {GIFObject} from "giphy-api";
import type Subscription from "@/ts/classes/Subscription";


const tmpCanvasContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!; // TODO why is it not safe?
const yotubeTimeRegex = /(?:(\d*)h)?(?:(\d*)m)?(?:(\d*)s)?(\d)?/;
const logger: Logger = loggerFactory.getLogger("htmlApi");

export const savedFiles: Record<string, Blob> = {};

if (IS_DEBUG) {
  window.savedFiles = savedFiles;
}

export const requestFileSystem: (type: number, size: number, successCallback: FileSystemCallback, errorCallback?: ErrorCallback) => void = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.requestFileSystem;
const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
  "\n": "<br>",
  "/": "&#x2F;",
};

export function forEach<T extends Node>(array: NodeListOf<T> | undefined, cb: (a: T) => void) {
  if (array && array.length) {
    for (let i = 0; i < array.length; i++) {
      cb(array[i]);
    }
  }
}


const imageUnicodeRegex = /[\u3501-\u3600]/g;
const patterns = [
  {
    search: /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|$))/g, /* http://anycharacter except end of text, <br> or space*/
    replace: "<a href=\"$1\" target=\"_blank\">$1</a>",
    name: "links",
  },
  {
    search: /<a href="http(?:s?):&#x2F;&#x2F;(?:www\.)?youtu(?:be\.com&#x2F;watch\?v=|\.be\/)([\w\-\_]*)(?:[^"]*?\&amp\;t=([\w\-\_]*))?[^"]*" target="_blank">[^<]+<\/a>/g,
    replace: "<div class=\"youtube-player\" data-id=\"$1\" data-time=\"$2\"><div><img src=\"https://i.ytimg.com/vi/$1/hqdefault.jpg\"><div class=\"icon-youtube-play\"></div></div></div>",
    name: "embeddedYoutube",
  },
  {
    search: /```(.+?)(?=```)```/g,
    replace: "<pre>$1</pre>",
    name: "highlightCode",
  },
  {
    search: new RegExp(`(^\(\d\d:\d\d:\d\d\)\s${USERNAME_REGEX}:)(.*)&gt;&gt;&gt;<br>`),
    replace: "<div class=\"quote\"><span>$1</span>$2</div>",
    name: "quote",
  },
];

export function getCurrentWordInHtml(el: HTMLElement) {
  let position = 0;
  const sel: Selection = window.getSelection()!;
  if (!sel.rangeCount) {
    return;
  }
  const range = sel.getRangeAt(0);
  if (range.commonAncestorContainer.parentNode === el) {
    position = range.endOffset;
  }
  // Get content of div
  const content = (range.commonAncestorContainer as any).data; // This this is undefined todo, really undefied somethng

  if (!content) { // Content is undefined when e.g. user selects all
    return "";
  }

  // Check if clicked at the end of word
  position = content[position] === " " ? position - 1 : position; /* TODO vue.js:1897 TypeError: Cannot read property '0' of undefined*/

  // Get the start and end index
  let startPosition = content.lastIndexOf(" ", position);
  startPosition = startPosition === content.length ? 0 : startPosition;
  let endPosition = content.indexOf(" ", position);
  endPosition = endPosition === -1 ? content.length : endPosition;

  return content.substring(startPosition + 1, endPosition);
}

export function sliceZero(n: number, count: number = -2) {
  return String(`00${n}`).slice(count);
}

export function timeToString(time: number) {
  const date = new Date(time);

  return [sliceZero(date.getHours()), sliceZero(date.getMinutes()), sliceZero(date.getSeconds())].join(":");
}

const replaceHtmlRegex = new RegExp(`[${Object.keys(escapeMap).join("")}]`, "g");

export function encodeHTML(html: string) {
  return html.replace(replaceHtmlRegex, (s) => escapeMap[s]);
}

export function getFlagPath(countryCode: string) {
  return getFlag(countryCode);
}

export function getGiphyHtml(gif: GIFObject) {
  let src;
  if (gif.images.fixed_height_small) {
    src = webpSupported && gif.images.fixed_height_small.webp ? gif.images.fixed_height_small.webp : gif.images.fixed_height_small.url;
  } else if (gif.images.fixed_height) {
    src = webpSupported && gif.images.fixed_height.webp ? gif.images.fixed_height.webp : gif.images.fixed_height.url;
  } else {
    throw Error(`Invalid image ${JSON.stringify(gif)}`);
  }
  const webp = gif.images.original.webp ? `webp="${gif.images.original.webp}"` : "";
  return `<img src="${src}" class="${PASTED_GIPHY_CLASS} ${PASTED_IMG_CLASS}" ${webp} url="${gif.images.original.url}" />`;
}

export function resolveMediaUrl<T extends string | null>(src: T): T {
  if (!src) {
    return null as T;
  }
  return src.startsWith("blob:http") ? src : `${MEDIA_API_URL}${src}` as T;
}

export async function encodeP(data: MessageModel, store: DefaultStore, smileyApi: SmileysApi): Promise<string> {
  if (!data.content) {
    throw Error(`Message ${data.id} doesn't have content`);
  }
  let html = encodeHTML(data.content);
  html = encodeFiles(html, data.files);

  html = encodePTags(html, data.tags, store);
  return smileyApi.encodeSmileys(html);
}


export const canvasContext: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d")!; // TODO wtf it's nullable?

export function placeCaretAtEnd(userMessage: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(userMessage);
  range.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    logger.warn("Can't place selection")();
  }
}

export function encodeMessageInited(data: MessageModel, store: DefaultStore, smileyApi: SmileysApi): string {
  // Logger.debug('Encoding message {}: {}', data.id, data)();
  if (!data.content) {
    throw Error(`Message ${data.id} doesn't have content`);
  }
  let html = encodeHTML(data.content);
  const replaceElements: unknown[] = [];
  patterns.forEach((pattern) => {
    if (store.userSettings &&
      store.userSettings[pattern.name as keyof CurrentUserSettingsModel] === false) { // Can be undefined as well
      return;
    }
    const res = html.replace(pattern.search, pattern.replace);
    if (res !== html) {
      replaceElements.push(pattern.name);
      html = res;
    }
  });
  if (replaceElements.length) {
    logger.debug("Replaced {} in message #{}", replaceElements.join(", "), data.id)();
  }
  html = encodeFiles(html, data.files);
  html = encodeTags(html, data.tags, store);
  return smileyApi.encodeSmileysSync(html);
}

function encodePTags(html: string, tags: Record<string, number> | null, store: DefaultStore) {
  if (tags && Object.keys(tags).length) {
    html = html.replace(imageUnicodeRegex, (s) => {
      const v = tags[s];
      if (v) {
        const tag = createTag(store.allUsersDict[v]);
        return tag.outerHTML;
      }

      return s; // If it's absent in files, it could be also in tags so return it. (don't replace )
    });
  }
  return html;
}

function encodeTags(html: string, tags: Record<string, number> | null, store: DefaultStore) {
  if (tags && Object.keys(tags).length) {
    html = html.replace(imageUnicodeRegex, (s) => {
      const v = tags[s];
      if (v) {
        return `<span user-id='${v}' symbol='${s}' class="tag-user">@${store.allUsersDict[v].username}</span>`;
      }

      return s; // If it's absent in files, it could be also in tags so return it. (don't replace )
    });
  }
  return html;
}


function encodeFiles(html: string, files: Record<string, FileModel> | null) {
  if (files && Object.keys(files).length) {
    html = html.replace(imageUnicodeRegex, (s) => {
      const v = files[s];
      if (v) {
        if (v.type === ImageType.IMAGE && v.preview) {
          return `<picture symbol='${s}' class='${PASTED_IMG_CLASS}' serverId="${v.serverId}">
            <source srcset="${resolveMediaUrl(v.preview!)}" type="image/webp">
            <source srcset="${resolveMediaUrl(v.url!)}"> 
            <img src="${resolveMediaUrl(v.url!)}">
          </picture>`;
        } else if (v.type === ImageType.IMAGE) {
          return `<img src='${resolveMediaUrl(v.url!)}' symbol='${s}' class='${PASTED_IMG_CLASS}' serverId="${v.serverId}"/>`;
        } else if (v.type === ImageType.VIDEO || v.type === ImageType.MEDIA_RECORD) {
          const className = v.type === ImageType.VIDEO ? "video-player" : "video-player video-record";

          return `<div class='${className}' serverId="${v.serverId}" associatedVideo='${v.url}'><div><img ${v.preview ? `src="${resolveMediaUrl(v.preview)}"` : ""} symbol='${s}' class='${PASTED_IMG_CLASS}'/><div class="icon-youtube-play"></div></div></div>`;
        } else if (v.type === ImageType.AUDIO_RECORD) {
          return `<img src='${recordIcon}' serverId="${v.serverId}" symbol='${s}' associatedAudio='${v.url}' class='audio-record'/>`;
        } else if (v.type === ImageType.FILE) {
          return `<a href="${resolveMediaUrl(v.url!)}" serverId="${v.serverId}" target="_blank" download><img src='${fileIcon}' symbol='${s}' class='uploading-file'/></a>`;
        } else if (v.type === ImageType.GIPHY) {
          // Giphy api sometimes doesn't contain webp, so it can be null
          return `<img serverId="${v.serverId}" src='${webpSupported && v.preview ? v.preview : v.url}' ${v.preview ? `webp="${v.preview}"` : ""} url="${v.url}" symbol='${s}' class='${PASTED_IMG_CLASS} ${PASTED_GIPHY_CLASS}'/>`;
        }
        logger.error("Invalid type {}", v.type)();
      }

      return s; // If it's absent in files, it could be also in tags so return it. (don't replace )
    });
  }

  return html;
}

let uniqueTagId = 1;

function getUniqueTagId() {
  return uniqueTagId++;
}

export function createTag(user: UserModel) {
  const a = document.createElement("span");

  const style = document.createElement("style");
  style.type = "text/css";
  const id = `usertag${getUniqueTagId()}`;
  style.innerHTML = ` #${id}:after { content: '@${user.username}'}`;
  document.getElementsByTagName("head")[0].appendChild(style);
  a.id = id;

  a.setAttribute("user-id", String(user.id));
  a.className = "tag-user";
  return a;
}

export function replaceCurrentWord(containerEl: HTMLElement, replacedTo: HTMLElement) {
  containerEl.focus();
  let range;
  const sel = window.getSelection()!;
  if (sel.rangeCount === 0) {
    logger.error("Can't place tag, rangeCount is 0")();
    return;
  }
  range = sel.getRangeAt(0).cloneRange()!;
  range.collapse(true);
  range.setStart(containerEl, 0);

  const words = range.toString().trim().
    split(" ");
  const lastWord = words[words.length - 1];

  if (!lastWord) {
    logger.error("Can't place tag, last word not found")();
  }
  logger.log(`replace word ${lastWord}`)();

  /* Find word start and end */
  const {data} = range.endContainer as any;
  if (!data) {
    logger.error("Can't place tag, Selected word data is null")();
    return;
  }
  const wordStart = data.lastIndexOf(lastWord);
  const wordEnd = wordStart + lastWord.length;
  logger.log(`pos: (${wordStart}, ${wordEnd})`)();

  range.setStart(range.endContainer, wordStart);
  range.setEnd(range.endContainer, wordEnd);
  range.deleteContents();
  range.insertNode(replacedTo);
  // Delete That specific word and replace if with resultValue

  range.setStartAfter(replacedTo);
  const textAfter = document.createTextNode(" ");
  range.insertNode(textAfter);
  range.setStartAfter(textAfter);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function pasteNodeAtCaret(img: Node, div: HTMLElement) {
  div.focus();
  const sel = window.getSelection();
  if (sel) {
    let range = sel.getRangeAt(0);
    range.deleteContents();

    /*
     * Range.createContextualFragment() would be useful here but is
     * non-standard and not supported in all browsers (IE9, for one)
     */
    const frag = document.createDocumentFragment();
    frag.appendChild(img);
    range.insertNode(frag);
    // Preserve the selection
    range = range.cloneRange();
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    div.appendChild(img);
    logger.warn("Can't handle selection")();
  }
}

export function pasteHtmlAtCaret(html: string, div: HTMLElement) {
  const divOuter = document.createElement("div");
  divOuter.innerHTML = html;
  const img: Node | null = divOuter.firstChild;
  if (!img) {
    throw Error("Can't paste image");
  }
  pasteNodeAtCaret(img, div);
}

export function setVideoEvent(e: HTMLElement) {
  const r: NodeListOf<HTMLElement> = e.querySelectorAll(".video-player");
  forEach(r, (e) => {
    const querySelector: HTMLElement = e.querySelector(".icon-youtube-play")!;
    const url: string = e.getAttribute("associatedVideo")!;
    logger.debug("Embedding video url {}", url)();
    querySelector.onclick = function(event) {
      const video = document.createElement("video");
      video.setAttribute("controls", "");
      video.className = "video-player-ready";
      logger.debug("Replacing video url {}", url)();
      video.src = resolveMediaUrl(url);
      e.parentNode!.replaceChild(video, e);
      video.play();
    };
  });
}

export function setAudioEvent(e: HTMLElement) {
  const r: NodeListOf<HTMLElement> = e.querySelectorAll(".audio-record");
  forEach<HTMLElement>(r, (e: HTMLElement) => {
    e.onclick = function(event) {
      const associatedAudio: string = e.getAttribute("associatedAudio")!;
      const url: string = resolveMediaUrl(associatedAudio);
      const audio = document.createElement("audio");
      audio.setAttribute("controls", "");
      audio.className = "audio-player-ready";
      logger.debug("Replacing audio url {}", url)();
      audio.src = url;
      e.parentNode!.replaceChild(audio, e);
      audio.play();
    };
  });
}

export function setImageFailEvents(e: HTMLElement, bus: Subscription) {
  const r = e.querySelectorAll("img");
  for (let i = 0; i < r.length; i++) {
    (function(img) {
      img.onerror = function() {
        this.className += " failed";
      };
      img.onload = function() {
        bus.notify({
          action: "scroll",
          handler: "*",
        });
      };
    }(r[i]));
  }
}

function getTime(time: string): number {
  let start = 0;
  if (time) {
    const res = yotubeTimeRegex.exec(time);
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
  const r: NodeListOf<HTMLElement> = e.querySelectorAll(".youtube-player");
  forEach(r, (a: HTMLElement) => {
    const querySelector: HTMLElement = a.querySelector(".icon-youtube-play")!;
    const id = a.getAttribute("data-id");
    logger.debug("Embedding youtube view {}", id)();
    querySelector.onclick = function(event: MouseEvent) {
      const iframe = document.createElement("iframe");
      let time: string = getTime(e.getAttribute("data-time")!).toString();
      if (time) {
        time = `&start=${time}`;
      } else {
        time = "";
      }
      const src = `https://www.youtube.com/embed/${id}?autoplay=1${time}`;
      iframe.setAttribute("src", src);
      iframe.setAttribute("frameborder", "0");
      iframe.className = "video-player-ready";
      logger.log("Replacing youtube url {}", src)();
      iframe.setAttribute("allowfullscreen", "1");
      e.parentNode!.replaceChild(iframe, e);
    };
  });
}

export function stopVideo(stream: MediaStream | null) {
  if (stream) {
    logger.debug("Stopping stream {}", stream)();
    if ((stream as any).stop) {
      (stream as any).stop();
    } else {
      stream.getTracks().forEach((e) => {
        e.stop();
      });
    }
  }
}

function setBlobName(blob: Blob) {
  if (!blob.name && blob.type.indexOf("/") > 1) {
    blob.name = `.${blob.type.split("/")[1]}`;
  }
}

function blobToImg(blob: Blob) {
  const img = document.createElement("img");
  img.className = PASTED_IMG_CLASS;
  const src = URL.createObjectURL(blob);
  img.src = src;
  setBlobName(blob);
  savedFiles[src] = blob;

  return img;
}

export function pasteBlobToContentEditable(blob: Blob, textArea: HTMLElement) {
  const img = blobToImg(blob);
  textArea.appendChild(img);
}

export function pasteBlobVideoToTextArea(file: Blob, textArea: HTMLElement, videoType: string, errCb: Function) {
  const video = document.createElement("video");
  video.style.opacity = "0";
  video.style.width = "0";
  video.style.height = "0";
  video.style.position = "absolute";
  document.body.appendChild(video);
  if (video.canPlayType(file.type)) {
    video.autoplay = false;
    const src = URL.createObjectURL(file);
    video.loop = false;
    video.addEventListener("loadedmetadata", () => {
      tmpCanvasContext.canvas.width = video.videoWidth;
      tmpCanvasContext.canvas.height = video.videoHeight;
      logger.log(`Loaded video metadata ${video.videoWidth}x${video.videoHeight}`)();
      setTimeout(() => {
        tmpCanvasContext.drawImage(video, 0, 0);
        tmpCanvasContext.canvas.toBlob(
          (blob) => {
            const img = document.createElement("img");
            if (!blob) {
              logger.error(`Failed to render 1st frame image for file ${file.name}, setting videoIcon instead`)();
              img.src = videoIcon;
            } else {
              const url = URL.createObjectURL(blob);
              savedFiles[url] = blob;
              if (file.name) {
                blob.name = `${file.name}.jpg`;
              } else {
                blob.name = ".jpg";
              }

              img.src = url;
            }
            img.className = PASTED_IMG_CLASS;
            img.setAttribute("videoType", videoType);
            img.setAttribute("associatedVideo", src);
            savedFiles[src] = file;
            pasteNodeAtCaret(img, textArea);
          },
          "image/jpeg",
          0.95,
        );
      }, 100); // https://stackoverflow.com/a/71900837/3872976
    }, false);
    video.src = src;
    video.load();
  } else {
    errCb(`Browser doesn't support playing ${file.type}`);
  }
}

export function pasteBlobAudioToTextArea(file: Blob, textArea: HTMLElement) {
  const img = document.createElement("img");
  const associatedAudio = URL.createObjectURL(file);
  img.setAttribute("associatedAudio", associatedAudio);
  img.className = `audio-record ${PASTED_IMG_CLASS}`;
  setBlobName(file);
  savedFiles[associatedAudio] = file;
  img.src = recordIcon;
  pasteNodeAtCaret(img, textArea);
}

export function pasteBlobFileToTextArea(file: Blob, textArea: HTMLElement) {
  const img = document.createElement("img");
  const associatedFile = URL.createObjectURL(file);
  img.setAttribute("associatedFile", associatedFile);
  img.className = `uploading-file ${PASTED_IMG_CLASS}`;
  setBlobName(file);
  savedFiles[associatedFile] = file;
  img.src = fileIcon;
  pasteNodeAtCaret(img, textArea);
}


export function pasteFileToTextArea(file: File, textArea: HTMLElement, errCb: Function) {
  if (file.size > 90_000_000) {
    errCb("Can't upload file greater than 90MB");
  } else {
    pasteBlobFileToTextArea(file, textArea);
  }
}

export function pasteImgToTextArea(file: File, textArea: HTMLElement, errCb: Function) {
  if (file.type.includes("image")) {
    const img = blobToImg(file);
    pasteNodeAtCaret(img, textArea);
  } else if (file.type.includes("video")) {
    pasteBlobVideoToTextArea(file, textArea, ImageType.VIDEO, errCb);
  } else {
    errCb(`Pasted file type ${file.type}, which is not an image`);
  }
}

export async function highlightCode(element: HTMLElement) {
  const s = element.querySelectorAll("pre");
  if (s.length) {
    const hljs = await import("highlight.js");
    for (let i = 0; i < s.length; i++) {
      hljs.default.highlightBlock(s[i]);
    }
  }
}

function nextChar(c: string): string {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

export function getMessageData(userMessage: HTMLElement, messageModel?: MessageModel): MessageDataEncode {
  let currSymbol: string = messageModel?.symbol ?? "\u3500";
  const files: Record<string, FileModel> | null = {}; // Return array from nodeList
  const images = userMessage.querySelectorAll(`.${PASTED_IMG_CLASS}`);
  forEach(images, (img) => {
    const oldSymbol = img.getAttribute("symbol");
    const src = img.getAttribute("src");
    const assVideo = img.getAttribute("associatedVideo") ?? null;
    const assAudio = img.getAttribute("associatedAudio") ?? null;
    const assFile = img.getAttribute("associatedFile") ?? null;
    const serverId = parseInt(img.getAttribute("serverId")!);
    const asGiphy = img.className.includes(PASTED_GIPHY_CLASS) ? img.getAttribute("url") : null;
    const asGiphyPreview = img.className.includes(PASTED_GIPHY_CLASS) ? img.getAttribute("webp") : null;
    const videoType: ImageType = img.getAttribute("videoType")! as ImageType;

    let elSymbol = oldSymbol;
    if (!elSymbol) {
      currSymbol = nextChar(currSymbol);
      elSymbol = currSymbol;
    }

    const textNode = document.createTextNode(elSymbol);
    img.parentNode!.replaceChild(textNode, img);

    if (messageModel?.files) {
      const fm: FileModel = messageModel.files[elSymbol];
      if (fm && !fm.sending) {
        files[elSymbol] = fm;
        return;
      }
    }
    let type: ImageType;
    if (videoType) {
      type = videoType;
    } else if (assAudio) {
      type = ImageType.AUDIO_RECORD;
    } else if (assFile) {
      type = ImageType.FILE;
    } else if (asGiphy) {
      type = ImageType.GIPHY;
    } else {
      type = ImageType.IMAGE;
    }

    let url: string;
    if (assAudio) {
      url = assAudio;
    } else if (assFile) {
      url = assFile;
    } else if (assVideo) {
      url = assVideo;
    } else if (asGiphy) {
      url = asGiphy;
    } else {
      url = src!;
    }
    let preview: string | null = null;
    if (assVideo && src !== videoIcon) {
      preview = src;
    } else if (asGiphyPreview) {
      preview = asGiphyPreview;
    } else if (src !== videoIcon) {
      preview = assVideo;
    }

    files[elSymbol] = {
      type,
      preview,
      url,
      serverId: serverId || null,
      sending: !asGiphy, // If it's not giphy, we need to transfer it to backend. giphy as absolute url already
      fileId: null,
      previewFileId: null,
    };
  });
  const tags: Record<string, number> = {};
  forEach(userMessage.querySelectorAll(".tag-user"), (img) => {
    currSymbol = nextChar(currSymbol);
    tags[currSymbol] = parseInt(img.getAttribute("user-id")!);

    // / https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
    img.replaceWith(document.createTextNode(currSymbol));
  });
  userMessage.innerHTML = userMessage.innerHTML.replace(/<img[^>]*symbol="([^"]+)"[^>]*>/g, "$1");
  let messageContent: string | null = typeof userMessage.innerText !== "undefined" ? userMessage.innerText : userMessage.textContent;
  messageContent = !messageContent || (/^\s*$/).test(messageContent) ? null : messageContent;
  if (messageContent) {
    messageContent = messageContent.trim();
  }
  userMessage.innerHTML = "";

  return {
    files,
    messageContent,
    currSymbol,
    tags,
  };
}
