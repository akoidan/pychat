import {Logger} from './Logger';
import {MessageModel, RoomModel, RootState, UserModel} from '../types';
import {
  AddOnlineUser,
  DefaultMessage, DeleteMessage,
  LoadMessages,
  MessageHandler,
  PrintMessage,
  RemoveOnlineUser,
  RoomDTO
} from './dto';
import loggerFactory from './loggerFactory';
import {Store} from 'vuex';
import {WsHandler} from './WsHandler';
import {Utils} from './htmlApi';
import {PASTED_IMG_CLASS} from './consts';
import {globalLogger} from './singletons';
import Api from './api';


export default class ChannelsHandler implements MessageHandler {
  private logger: Logger;
  private store: Store<RootState>;
  private ws: WsHandler;
  private api: Api;

  constructor(store: Store<RootState>, api: Api) {
    this.store = store;
    this.api = api;
    this.logger = loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold');
  }

  public setWsHandler(ws: WsHandler) {
    this.ws = ws;
  }

  public setUsers(users: {[id: string]: UserModel}) {
    this.store.commit('setUsers', users);
  }

  private handleloadMessages(lm: LoadMessages) {
    if (lm.content.length > 0) {
      let messages = this.store.state.rooms[lm.roomId].messages;
      let oldMessages = {};
      messages.forEach(m => {
        oldMessages[m.id] = true;
      });
      lm.content.filter(i => oldMessages[i.id]);
      messages = messages.concat(lm.content);
      messages.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      this.store.commit('setMessages', {messages, roomId: lm.roomId});
    } else {
      this.store.commit('setAllLoaded', lm.roomId);
    }
  }

  handleaddOnlineUser(message: AddOnlineUser) {
    if (!this.store.state.allUsers[message.userId]) {
      this.store.commit('addUser', {userId: message.userId, user: message.user, sex: message.sex});
    }
    this.store.commit('setOnline', message.content);
  }

  handleremoveOnlineUser(message: RemoveOnlineUser) {
    this.store.commit('setOnline', message.content);
  }


  nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  }

  getPastedImage (currSymbol: string, userMessage: HTMLTextAreaElement) {
    let res = []; // return array from nodeList
    let images = userMessage.querySelectorAll('.' + PASTED_IMG_CLASS);
    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      let elSymbol = img.getAttribute('code');
      if (!elSymbol) {
        currSymbol = this.nextChar(currSymbol);
        elSymbol = currSymbol;
      }
      let textNode = document.createTextNode(elSymbol);
      img.parentNode.replaceChild(textNode, img);
      if (!img.getAttribute('symbol')) { // don't send image again, it's already in server
        let assVideo = img.getAttribute('associatedVideo');
        if (assVideo) {
          res.push({
            file: Utils.videoFiles[assVideo],
            type: 'v',
            symbol:  elSymbol
          });
          res.push({
            file: Utils.previewFiles[img.getAttribute('src')],
            type: 'p',
            symbol:  elSymbol
          });
        } else {
          res.push({
            file: Utils.imagesFiles[img.getAttribute('src')],
            type: 'i',
            symbol:  elSymbol
          });
        }
      }
    }
    let urls = [Utils.imagesFiles, Utils.videoFiles, Utils.previewFiles];
    urls.forEach(function(url) {
      for (let k in url) {
        globalLogger.log('Revoking url {}', k)();
        URL.revokeObjectURL(k);
        delete urls[k];
      }
    });
    return res;
  }

  private handleprintMessage(message: PrintMessage) {
    let r: RoomModel = this.store.state.rooms[message.roomId];
    if (r.messages.find(m => m.id === message.id)) {
      this.logger.log('Skipping printing message {}, because it\'s already in list', message)();
    } else {
      let messsage: MessageModel = {
        id: message.id,
        time: message.time,
        files: message.files,
        content: message.content,
        symbol: message.symbol || null,
        edited: message.edited || null,
        roomId: message.roomId,
        userId: message.userId,
        giphy: message.giphy || null,
        deleted: message.deleted || null
      };
      this.store.commit('addMessage', {message, roomId: message.roomId});
    }
  }

  handleDeleteMessage(message: DeleteMessage) {
    let r: RoomModel = this.store.state.rooms[message.roomId];
    let storeMessage = r.messages.find(m => m.id === message.id);
    if (storeMessage) {
      this.store.commit('deleteMessage', storeMessage);
    }
  }


  public sendMessage(roomId, userMessage: HTMLTextAreaElement) {
    if (!this.ws.isWsOpen()) {
      this.store.dispatch('growlError', `Can't send message, can't connect to the server`);
      return;
    }
    let em = this.store.state.editedMessage;
    let isEdit = em && em.isEditingNow ? em.messageId : null;
    let currSymbol = '\u3500'; // it's gonna increase in getPastedImage
    let editedMessage = this.store.state.rooms[roomId].messages.find(a => a.id === isEdit);
    if (isEdit && editedMessage) {
      // dom can be null if we cleared the history
      // in this case symbol will be parsed in be
      let newSymbol = editedMessage.symbol;
      if (newSymbol) {
        currSymbol = newSymbol;
      }
    }
    let files = this.getPastedImage(currSymbol, userMessage);
    userMessage.innerHTML = userMessage.innerHTML.replace(/<img[^>]*code="([^"]+)"[^>]*>/g, '$1');
    let messageContent = typeof userMessage.innerText !== 'undefined' ? userMessage.innerText : userMessage.textContent;
    messageContent = /^\s*$/.test(messageContent) ? null : messageContent;
    // self.removeEditingMode(); TODO
    userMessage.innerHTML = '';
    if (files.length) {
      let fd = new FormData();
      files.forEach(function(sd) {
        fd.append(sd.type + sd.symbol, sd.file, sd.file.name);
      });
      let gr;
      let db;
      let text;
      this.api.uploadFile(fd, (res, err) => {
        if (err) {
          this.store.dispatch('growlError', err);
        } else if (isEdit) {
          this.ws.sendEditMessage(messageContent, isEdit, res);
        } else if (messageContent) {
          this.ws.sendSendMessage(messageContent, roomId, res);
        }
      }, evt => {
          if (evt.lengthComputable) {

            // TODO evt.loaded
            // if (!db) {
            //   let div = document.createElement("DIV");
            //   let holder = document.createElement("DIV");
            //   text = document.createElement("SPAN");
            //   holder.appendChild(text);
            //   holder.appendChild(div);
            //   text.innerText = "Uploading files...";
            //   db = new DownloadBar(div, evt.total);
            //   gr = new Growl(null, null, holder);
            //   gr.show();
            // }
            // db.setValue(evt.loaded);
            // if (evt.loaded === evt.total) {
            //   text.innerText = "Server is processing files...";
            // }
          }
        });
    } else {
      if (isEdit) {
        this.ws.sendEditMessage(messageContent, isEdit, []);
      } else if (messageContent) {
        this.ws.sendSendMessage(messageContent, roomId, []);
      }
    }
  }


  public setRooms(rooms: {[id: string]: RoomDTO}) {
    this.logger.debug('Setting rooms')();
    let dict: { [id: number]: RoomModel } = {};
    for (let id in rooms) {
      let oldRoom = this.store.state.rooms[id];
      let newRoom = rooms[id];
      if (oldRoom) {
        dict[id] = {
          messages: oldRoom.messages,
          name: newRoom.name,
          notifications: newRoom.notifications,
          users: newRoom.users,
          volume: newRoom.volume,
          allLoaded: oldRoom.allLoaded
        };
      } else {
        dict[id] = {
          messages: [],
          name: newRoom.name,
          notifications: newRoom.notifications,
          users: newRoom.users,
          volume: newRoom.volume,
          allLoaded: false
        };
      }
    }
    this.store.commit('setRooms', dict);
  }

  public setOnline(online: number[]) {
    this.store.commit('setOnline', online);
  }



  public handle(message: DefaultMessage) {
    if (this[`handle${message.action}`]) {
      this[`handle${message.action}`](message);
    } else if (message.handler === 'chat') {
      throw `Can't find handler for ${message.action} for message ${JSON.stringify(message)}`;
    }
  }


}
