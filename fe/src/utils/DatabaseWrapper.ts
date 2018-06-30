import {IStorage, SetRoomsUsers} from '../types/types';
import loggerFactory from './loggerFactory';
import {Logger} from 'lines-logger';
import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageModel, RoomDictModel, RoomModel,
  RoomSettingsModel,
  UserModel
} from '../types/model';
import {convertSexToNumber, convertSexToString, convertStringSexToNumber} from '../types/converters';
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

  private executeSql(t: SQLTransaction, sql: string, args: any[] = [], cb = undefined, e = undefined): Function {
    if (!e) {
      e = (t: SQLTransaction, e: SQLError) => {
        return this.logger.error('{} {}, error: {}, message {}', sql, args, e, e && e.message)();
      };
    }
    t.executeSql(sql, args, cb, e);
    return this.logger.debug('{} {}', sql, args);
  }

  public connect(cb: Function) {
    this.logger.log('Initializing database')();
    this.db = window.openDatabase(this.dbName, '', 'Messages database', 10 * 1024 * 1024);
    if (this.db.version === '') {
      Promise.resolve().then(() => new Promise((resolve, reject) => {
        this.db.changeVersion(this.db.version, '1.0', (t) => resolve(t), e => reject(e));
      })).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE user (id integer primary key, user text, sex integer NOT NULL CHECK (sex IN ((0,1,2))), deleted boolean NOT NULL CHECK (deleted IN (0,1)) )', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE room (id integer primary key, name text, notifications boolean NOT NULL CHECK (notifications IN (0,1)), volume integer, deleted boolean NOT NULL CHECK (deleted IN (0,1)))', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), giphy text, edited integer, roomId integer REFERENCES room(id), userId integer REFERENCES user(id))', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE file (id integer primary key, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text);', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE settings (userId integer primary key, embeddedYoutube boolean NOT NULL CHECK (embeddedYoutube IN (0,1)), highlightCode boolean NOT NULL CHECK (highlightCode IN (0,1)), incomingFileCallSound boolean NOT NULL CHECK (incomingFileCallSound IN (0,1)), messageSound boolean NOT NULL CHECK (messageSound IN (0,1)), onlineChangeSound boolean NOT NULL CHECK (onlineChangeSound IN (0,1)), sendLogs boolean NOT NULL CHECK (sendLogs IN (0,1)), suggestions boolean NOT NULL CHECK (suggestions IN (0,1)), theme text, logs boolean NOT NULL CHECK (logs IN (0,1)))', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE profile (userId integer primary key, user text, name text, city text, surname text, email text, birthday text, contacts text, sex integer NOT NULL CHECK (sex IN ((0,1,2))))', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction) => {
        return new Promise((resolve, reject) => {
          this.executeSql(t, 'CREATE TABLE room_users (room_id INTEGER REFERENCES room(id), user_id INTEGER REFERENCES user(id))', [], (t) => resolve(t), (t, e) => reject(e))();
        });
      }).then((t: SQLTransaction)  => {
        cb(true);
        this.logger.log('DatabaseWrapper has been initialized with version {}', this.db.version)();
      }).catch(reason => {
        this.logger.error('Failed creating db {}, message {}', reason, reason.message)();
        cb(false);
      });
    } else if (this.db.version === '1.0') {
      this.logger.log('Created new db connection')();
      cb(true);
    }
  }

  public getAllTree() {
    this.read(t => {
          Promise.all([
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from file', [], (t, d) => resolve(d), (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from profile', [], (t, d) => {

              }, (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from room', [], (t, d) => resolve(d), (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from room_users', [], (t, d) => resolve(d), (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from settings', [], (t, d) => resolve(d), (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from user', [], (t, d) => resolve(d), (t, e) => reject(e))();
            }),
            new Promise((resolve, reject) => {
              this.executeSql(t, 'select * from message', [], (t, d) => resolve(d), (t, e) => reject(e))();
            })
          ]).then((f: any ) => {
            let files = f[0].rows;
            let profile = f[1].rows;
            let rooms = f[2].rows;
            let roomUsers = f[3].rows;
            let settings = f[4].rows;
            let users = f[5].rows;
            let messages = f[6].rows;
            let up: CurrentUserInfoModel = {
              sex: convertSexToString(profile.sex),
              contacts: profile.contacts,
              birthday: profile.birthday,
              email: profile.email,
              surname: profile.surname,
              city: profile.city,
              name: profile.name,
              userId: profile.userId,
              user: profile.user
            };
            let us: CurrentUserSettingsModel = {
              embeddedYoutube: settings.embeddedYoutube ? true : false,
              highlightCode: settings.highlightCode ? true : false,
              incomingFileCallSound: settings.incomingFileCallSound ? true : false,
              messageSound: settings.messageSound ? true : false,
              onlineChangeSound: settings.onlineChangeSound ? true : false,
              sendLogs: settings.sendLogs ? true : false,
              suggestions: settings.suggestions ? true : false,
              theme: settings.theme,
              logs: settings.logs ? true : false,
            };
            let ro: RoomDictModel = {};
            rooms.forEach(r => {
              let rm: RoomModel = {
                id: r.id,
                allLoaded: false,
                users: [],
                volume: r.volume,
                notifications: r.notifications ? true : false,
                name: r.name,
                messages: {},
                search: null
              };
              ro[r.id] = rm;
            });
            this.logger.log('restored state from db {}', f)();
          }).catch(reason => {
            this.logger.error('Unable to load state from db, because {}')();
          });
        }
    );
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

  // public getRoomHeaderId (id: number, cb: Function) {
  //   this.read((t, id, cb ) => {
  //     this.executeSql(t, 'select min(id) as min from message where roomId = ?', [id], (t, d) => {
  //       cb(d.rows.length ? d.rows[0].min : null);
  //     });
  //   });
  // }

  // public getIds (cb) {
  //   this.read(t => {
  //     this.executeSql(t, 'select max(id) as max, roomId, min(id) as min from message group by roomId', [],  (t, d) => {
  //       let res = {};
  //       for (let i = 0; i < d.rows.length; i++) {
  //         let e = d.rows[i];
  //         res[e.roomId] = {h: e.min, f: this.cache[e.roomId] || e.max};
  //       }
  //       cb(res);
  //     });
  //   });
  // }

  public clearStorage () {
    this.write(t => {
      this.executeSql(t, 'delete from room_users')();
      this.executeSql(t, 'delete from user')();
      this.executeSql(t, 'delete from room')();
      this.executeSql(t, 'delete from file')();
      this.executeSql(t, 'delete from message')();
      this.executeSql(t, 'delete from settings')();
      this.executeSql(t, 'delete from profile')();
      this.logger.log('Db has been cleared')();
    });
  }

  private getMessages (t, cb) {
    this.executeSql(t, 'SELECT * FROM message', [], (t, m) => {
      this.executeSql(t, 'SELECT * from file', [],  (t, i) => {
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
      })();
    })();
    return cb;
  }

  public insertMessage (t, message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
    this.executeSql(t, 'insert or replace into message (id, time, content, symbol, deleted, giphy, edited, roomId, userId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [message.id, message.time, message.content, message.symbol || null, message.deleted ? 1 : 0, message.giphy || null, message.edited, message.roomId, message.userId], (t, d) => {
          for (let k in message.files) {
            let f = message.files[k];
            this.executeSql(t, 'insert or replace into file (id, symbol, url, message_id, type, preview) values (?, ?, ?, ?, ?, ?)', [f.id, k, f.url, message.id, f.type, f.preview])();
          }
        })();
  }


  private setRoom(t: SQLTransaction, room: RoomSettingsModel) {
    this.executeSql(t, 'insert or replace into room (id, name, notifications, volume, deleted) values (?, ?, ?, ?, 0)', [room.id, room.name, room.notifications ? 1 : 0, room.volume])();
  }

  public saveRoom(room: RoomModel) {
    this.write(t => {
      this.setRoom(t, room);
      this.setRoomUsers(t, room.id, room.users);
    });
  }

  public setRooms(rooms: RoomModel[]) {
    this.write(t => {
      this.executeSql(t, 'update room set deleted = 1', [], (t) => {
        rooms.forEach(r => this.setRoom(t, r));
      })();
      this.executeSql(t, 'delete from room_users', [], (t) => {
        rooms.forEach(r => {
          r.users.forEach(u => {
            this.insertRoomUsers(t, r.id, u);
          });
        });
      })();
    });
  }

  private insertRoomUsers(t, roomId, userId) {
    this.executeSql(t, 'insert into room_users (room_id, user_id) values (?, ?)', [roomId, userId])();
  }

  public insertUser(t: SQLTransaction, user: UserModel) {
    this.executeSql(t, 'insert or replace into user (id, user, sex, deleted) values (?, ?, ?, 0)', [user.id, user.user, convertSexToNumber(user.sex)])();
  }

  public saveUser(user: UserModel) {
    this.write(t => this.insertUser(t, user));
  }

  public setUsers(users: UserModel[]) {
    this.write(t => {
      this.executeSql(t, 'update user set deleted = 1', [])();
      users.forEach(u => this.insertUser(t, u));
    });
  }

  public setUserProfile(user: CurrentUserInfoModel) {
    this.write(t => {
      this.executeSql(t, 'insert or replace into profile (userId, user, name, city, surname, email, birthday, contacts, sex) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.userId, user.user, user.name, user.city, user.surname, user.email, user.birthday, user.contacts, convertStringSexToNumber(user.sex)])();
    });
  }

  public setUserSettings(settings: CurrentUserSettingsModel) {
    this.write(t => {
      this.executeSql(t, 'insert or replace into settings (userId, embeddedYoutube, highlightCode, incomingFileCallSound, messageSound, onlineChangeSound, sendLogs, suggestions, theme, logs) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, settings.embeddedYoutube ? 1 : 0, settings.highlightCode ? 1 : 0, settings.incomingFileCallSound ? 1 : 0, settings.messageSound ? 1 : 0, settings.onlineChangeSound ? 1 : 0, settings.sendLogs ? 1 : 0, settings.suggestions ? 1 : 0, settings.theme, settings.logs ? 1 : 0])();
    });
  }


  public deleteMessage(id: number) {
    this.write(t => {
      this.executeSql(t, 'update message set deleted = 1 where id = ? ', [id])();
    });
  }

  public deleteRoom(id: number) {
    this.write(t => {
      this.executeSql(t, 'update room set deleted = 1 where id = ? ', [id])();
    });
  }

  public saveRoomUsers(ru: SetRoomsUsers) {
    this.write(t => {
      this.setRoomUsers(t, ru.roomId, ru.users);
    });
  }

  private setRoomUsers(t, roomId: number, users: number[]) {
    this.executeSql(t, 'delete from room_users where room_id = ?', [roomId], t => {
      users.forEach(u => {
        this.insertRoomUsers(t, roomId, u);
      });
    })();
  }

  public updateRoom(r: RoomSettingsModel) {
    this.write(t => {
      this.executeSql(t, 'update room set name = ?, volume = ?, notifications = ? where id = ? ', [r.name, r.volume, r.notifications, r.id])();
    });
  }

  public saveMessages( messages: MessageModel[]) {
    this.write(t => {
      messages.forEach(m => {
        this.insertMessage(t, m);
      });
    });
  }

  public saveMessage(m: MessageModel) {
    this.write(t => {
        this.insertMessage(t, m);
    });
  }


  public setRoomHeaderId(roomId: number, headerId: number) {
    if (!this.cache[roomId] || this.cache[roomId] < headerId) {
      this.cache[roomId] = headerId;
    }
  }

}