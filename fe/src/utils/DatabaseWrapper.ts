import {IStorage} from '../types/types';
import loggerFactory from './loggerFactory';
import {Logger} from 'lines-logger';
import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageModel,
  RoomSettingsModel,
  UserModel
} from '../types/model';
interface TransactionCb { (t: SQLTransaction, ...rest): void; }

export default class DatabaseWrapper implements IStorage {
  private logger: Logger;
  private dbName: String;
  private db: Database;
  private cache: object = {};

  constructor(dbName: String ) {
    this.logger = loggerFactory.getLoggerColor('db', '#753e01');
    this.dbName = dbName;
  }


  public connect(cb: Function) {
    this.logger.log('Initializing database')();
    this.db = window.openDatabase(this.dbName, '', 'Messages database', 10 * 1024 * 1024);
    if (this.db.version === '') {
      Promise.resolve().then(() => new Promise((resolve, reject) => {
        this.db.changeVersion(this.db.version, '1.0',  (t) => {
          resolve(t);
        }, e => {
          reject(`Error during creating database {} ${e}`);
        });
      })).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE user (id integer primary key, user text, sex integer)', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE room (id integer primary key, name text, notifications boolean NOT NULL CHECK (notifications IN (0,1)), volume integer)', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), giphy text, edited integer, roomId integer REFERENCES room(id), userId integer REFERENCES user(id))', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE image (id integer primary key, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text);', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE settings (userId integer primary key, embeddedYoutube boolean NOT NULL CHECK (embeddedYoutube IN (0,1)), highlightCode boolean NOT NULL CHECK (highlightCode IN (0,1)), incomingFileCallSound boolean NOT NULL CHECK (incomingFileCallSound IN (0,1)), messageSound boolean NOT NULL CHECK (messageSound IN (0,1)), onlineChangeSound boolean NOT NULL CHECK (onlineChangeSound IN (0,1)), sendLogs boolean NOT NULL CHECK (sendLogs IN (0,1)), suggestions boolean NOT NULL CHECK (suggestions IN (0,1)), theme text, logs boolean NOT NULL CHECK (logs IN (0,1)))', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE profile (userId integer primary key, user text, name text, city text, surname text, email text, birthday text, contacts text, sex integer)', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        return new Promise((resolve, reject) => {
          t.executeSql('CREATE TABLE room_users (room_id INTEGER REFERENCES room(id), user_id INTEGER REFERENCES user(id))', [], (t) => resolve(t));
        });
      }).then((t: SQLTransaction)  => {
        cb(true);
        this.logger.log('DatabaseWrapper has been initialized with version {}', this.db.version)();
      });
    } else if (this.db.version === '1.0') {
      this.logger.log('Created new db connection')();
      cb(true);
    }
  }
  
  private transaction(transactionType: string, cb: TransactionCb) {
    this.db[transactionType]( t => {
      cb(t);
    }, (e) => {
      this.logger.error('Error during saving message {}', e)();
    });
  }

  private read(cb: TransactionCb) {
    return this.transaction('transaction', cb);
  }

  private write(cb: TransactionCb) {
    return this. transaction('transaction', cb);
  }

  public getRoomHeaderId (id: number, cb: Function) {
    this.read((t, id, cb ) => {
      t.executeSql('select min(id) as min from message where roomId = ?', [id], function(t, d) {
        cb(d.rows.length ? d.rows[0].min : null);
      });
    });
  }

  public getIds (cb) {
    this.read(t => {
      t.executeSql('select max(id) as max, roomId, min(id) as min from message group by roomId', [],  (t, d) => {
        let res = {};
        for (let i = 0; i < d.rows.length; i++) {
          let e = d.rows[i];
          res[e.roomId] = {h: e.min, f: this.cache[e.roomId] || e.max};
        }
        cb(res);
      });
    });
  }

  public clearStorage () {
    this.write(t => {
      t.executeSql('delete from message');
      t.executeSql('delete from image');
      this.logger.log('Db has been cleared')();
    });
  }

  private getMessages (t, cb) {
    t.executeSql('SELECT * FROM message', [], (t, m) => {
      t.executeSql('SELECT * from image', [],  (t, i) => {
        let mid = {};
        let messages = [];
        for (let j = 0; j < m.rows.length; j++) {
          let e = m.rows[j];
          mid[e.id] = e;
          e.files = {};
          messages.push(e);
        }
        for (let j = 0; j < i.rows.length; j++) {
          let e = i.rows[j];
          mid[e.message_id].files[e.symbol] = e;
        }
        cb(messages);
      });
    });
    return cb;
  }

  public insertMessage (t, message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
    t.executeSql('insert or replace into message (id, time, content, symbol, deleted, giphy, edited, roomId, userId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [message.id, message.time, message.content, message.symbol || null, message.deleted ? 1 : 0, message.giphy || null, message.edited, message.roomId, message.userId], function (t, d) {
          for (let k in message.files) {
            let f = message.files[k];
            t.executeSql('insert or replace into image (id, symbol, url, message_id, type, preview) values (?, ?, ?, ?, ?, ?)', [f.id, k, f.url, message.id, f.type, f.preview]);
          }
        });
  }


  private setRoom(t: SQLTransaction, room: RoomSettingsModel) {
    t.executeSql('insert or replace into room (id, name, notifications, volume) values (?, ?, ?, ?)', [room.id, room.name, room.notifications, room.volume]);
  }

  public setRooms(rooms: RoomSettingsModel[]) {
    this.write(t => {
      rooms.forEach(r => this.setRoom(t, r));
    });
  }

  public setUser(t: SQLTransaction, user: UserModel) {
    t.executeSql('insert or replace into user (id, user, sex) values (?, ?, ?)', [user.id, user.user, user.sex]);
  }

  public setUsers(users: UserModel[]) {
    this.write(t => {
      users.forEach(u => this.setUser(t, u));
    });
  }

  public setUserProfile(user: CurrentUserInfoModel) {
    this.write(t => {
      t.executeSql('insert or replace into profile (userId, user, name, city, surname, email, birthday, contacts, sex) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.userId, user.user, user.name, user.city, user.surname, user.email, user.birthday, user.contacts, user.sex]);
    });
  }

  public setUserSettings(userId, settings: CurrentUserSettingsModel) {
    this.write(t => {
      t.executeSql('insert or replace into settings (userId, embeddedYoutube, highlightCode, incomingFileCallSound, messageSound, onlineChangeSound, sendLogs, suggestions, theme, logs) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [userId, settings.embeddedYoutube, settings.highlightCode, settings.incomingFileCallSound, settings.messageSound, settings.onlineChangeSound, settings.sendLogs, settings.suggestions, settings.theme, settings.logs]);
    });
  }


  public deleteMessage(id: number) {
    this.write(t => {
      t.executeSql('update message set deleted = 1 where id = ? ', [id]);
    });
  }

  public saveMessages( messages: MessageModel[]) {
    this.write(t => {
      messages.forEach(m => {
        this.insertMessage(t, m);
      });
    });
  }

  public setRoomHeaderId(roomId: number, headerId: number) {
    if (!this.cache[roomId] || this.cache[roomId] < headerId) {
      this.cache[roomId] = headerId;
    }
  }

}