import {
  IStorage,
  SetFileIdsForMessage,
  SetRoomsUsers,
} from '@/ts/types/types';
import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';
import {
  BlobType,
  ChannelModel,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  MessageModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserModel
} from '@/ts/types/model';
import {
  convertNumberToSex,
  convertSexToNumber,
  convertSexToString,
  convertStringSexToNumber,
  convertToBoolean,
  getChannelDict,
  getRoomsBaseDict
} from '@/ts/types/converters';
import {
  ChannelDB,
  FileDB,
  MessageDB,
  ProfileDB,
  RoomDB,
  RoomUsersDB,
  SettingsDB,
  TransactionType,
  UserDB
} from '@/ts/types/db';
import { browserVersion } from '@/ts/utils/runtimeConsts';
import { SetStateFromStorage } from '@/ts/types/dto';

type TransactionCb = (t: SQLTransaction, ...rest: unknown[]) => void;

export default class DatabaseWrapper implements IStorage {
  private readonly logger: Logger;
  private readonly dbName: String;
  private db: Database|null = null;
  private readonly cache: { [id: number]: number } = {};

  constructor() {
    this.dbName = 'v142';
    this.logger = loggerFactory.getLoggerColor(`db:${this.dbName}`, '#753e01');
  }

  public async connect(): Promise<boolean> {
    this.db = window.openDatabase(this.dbName, '', 'Messages database', 10 * 1024 * 1024);
    if (this.db.version === '') {
      this.logger.log('Initializing database')();
      let t: SQLTransaction = await new Promise<SQLTransaction>((resolve, reject) => {
        this.db!.changeVersion(this.db!.version, '1.0', resolve, reject);
      });
      t = await this.runSql(t, 'CREATE TABLE user (id integer primary key, user text, sex integer NOT NULL CHECK (sex IN (0,1,2)), deleted boolean NOT NULL CHECK (deleted IN (0,1)), country_code text, country text, region text, city text)');
      t = await this.runSql(t, 'CREATE TABLE channel (id integer primary key, name text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), creator INTEGER REFERENCES user(id))');
      t = await this.runSql(t, 'CREATE TABLE room (id integer primary key, name text, p2p boolean NOT NULL CHECK (p2p IN (0,1)), notifications boolean NOT NULL CHECK (notifications IN (0,1)), volume integer, deleted boolean NOT NULL CHECK (deleted IN (0,1)), channel_id INTEGER REFERENCES channel(id), creator INTEGER REFERENCES user(id))');
      t = await this.runSql(t, 'CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), giphy text, edited integer, roomId integer REFERENCES room(id), userId integer REFERENCES user(id), sending boolean NOT NULL CHECK (sending IN (0,1)), parent_message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE, thread_messages_count INTEGER)');
      t = await this.runSql(t, 'CREATE TABLE file (id integer primary key, sending boolean NOT NULL CHECK (sending IN (0,1)), preview_file_id integer, file_id integer, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text)');
      t = await this.runSql(t, 'CREATE TABLE settings (userId integer primary key, embeddedYoutube boolean NOT NULL CHECK (embeddedYoutube IN (0,1)), highlightCode boolean NOT NULL CHECK (highlightCode IN (0,1)), incomingFileCallSound boolean NOT NULL CHECK (incomingFileCallSound IN (0,1)), messageSound boolean NOT NULL CHECK (messageSound IN (0,1)), onlineChangeSound boolean NOT NULL CHECK (onlineChangeSound IN (0,1)), sendLogs boolean NOT NULL CHECK (sendLogs IN (0,1)), suggestions boolean NOT NULL CHECK (suggestions IN (0,1)), theme text, logs text)');
      t = await this.runSql(t, 'CREATE TABLE profile (userId integer primary key, user text, name text, city text, surname text, email text, birthday text, contacts text, sex integer NOT NULL CHECK (sex IN (0,1,2)))');
      t = await this.runSql(t, 'CREATE TABLE room_users (room_id INTEGER REFERENCES room(id), user_id INTEGER REFERENCES user(id))');
      this.logger.log('DatabaseWrapper has been initialized')();
      return true;
    } else if (this.db.version === '1.0') {
      this.logger.log('Created new db connection')();

      return false;
    }

    return false;
  }

  public async getAllTree(): Promise<SetStateFromStorage|null> {
    const t: SQLTransaction = await this.asyncWrite();
    const f: unknown[][] = await Promise.all<unknown[]>([
      'select * from file',
      'select * from profile',
      'select * from room where deleted = 0',
      'select * from room_users',
      'select * from settings',
      'select * from user where deleted = 0',
      'select * from message',
      'select * from channel'
    ].map(sql => new Promise((resolve, reject) => {
      this.executeSql(t, sql, [], (t: SQLTransaction, d: SQLResultSet) => {
        this.logger.debug('sql {} fetched {} ', sql, d)();
        const res: unknown[] = [];
        for (let i = 0; i < d.rows.length; i++) {
          const rows: SQLResultSetRowList = d.rows;
          res.push(rows.item(i)); // TODO does that work
        }
        resolve(res);
      },              (t: SQLTransaction, e: SQLError) => {
        reject(e);

        return false;
      })();
    })));

    const dbFiles: FileDB[] = f[0] as FileDB[],
        dbProfile: ProfileDB[] = f[1] as ProfileDB[],
        dbRooms: RoomDB[] = f[2] as RoomDB[],
        dbRoomUsers: RoomUsersDB[] = f[3] as RoomUsersDB[],
        dbSettings: SettingsDB[] = f[4] as SettingsDB[],
        dbUsers: UserDB[] = f[5] as UserDB[],
        dbMessages: MessageDB[] = f[6] as MessageDB[],
        dbChannels: ChannelDB[] = f[7] as ChannelDB[];
    this.logger.debug('resolved all sqls')();

    if (dbProfile.length) {
      const profile: CurrentUserInfoModel = {
        sex: convertSexToString(dbProfile[0].sex),
        contacts: dbProfile[0].contacts,
        birthday: dbProfile[0].birthday,
        email: dbProfile[0].email,
        surname: dbProfile[0].surname,
        city: dbProfile[0].city,
        name: dbProfile[0].name,
        userId: dbProfile[0].userId,
        user: dbProfile[0].user
      };
      const settings: CurrentUserSettingsModel = {
        embeddedYoutube: convertToBoolean(dbSettings[0].embeddedYoutube),
        highlightCode: convertToBoolean(dbSettings[0].highlightCode),
        incomingFileCallSound: convertToBoolean(dbSettings[0].incomingFileCallSound),
        messageSound: convertToBoolean(dbSettings[0].messageSound),
        onlineChangeSound: convertToBoolean(dbSettings[0].onlineChangeSound),
        sendLogs: convertToBoolean(dbSettings[0].sendLogs),
        suggestions: convertToBoolean(dbSettings[0].suggestions),
        theme: dbSettings[0].theme,
        logs: dbSettings[0].logs,
      };
      const roomsDict: RoomDictModel = {};
      dbRooms.forEach((r: RoomDB) => {
        const rm: RoomModel = getRoomsBaseDict({
          roomId: r.id,
          p2p: convertToBoolean(r.p2p),
          notifications: convertToBoolean(r.notifications),
          name: r.name,
          channelId: r.channel_id,
          roomCreatorId: r.creator,
          users: [],
          volume: r.volume
        });
        roomsDict[r.id] = rm;
      });
      dbRoomUsers.forEach(ru => {
        roomsDict[ru.room_id].users.push(ru.user_id);
      });
      const allUsersDict: { [id: number]: UserModel } = {};
      dbUsers.forEach(u => {
        const user: UserModel = {
          id: u.id,
          sex: convertNumberToSex(u.sex),
          user: u.user,
          location: {
            region: u.region,
            city: u.city,
            countryCode: u.country_code,
            country: u.country
          }
        };
        allUsersDict[u.id] = user;
      });

      const am: Record<string, MessageModel> = {};
      dbMessages.forEach(m => {
        const message: MessageModel = {
          id: m.id,
          roomId: m.roomId,
          isHighlighted: false,
          time: m.time,
          isEditingActive: false,
          isThreadOpened: false,
          threadMessagesCount: m.thread_messages_count,
          deleted: convertToBoolean(m.deleted),
          transfer: m.sending ? {
            error: null,
            upload: null
          } : null,
          files: {},
          sending: convertToBoolean(m.sending),
          edited: m.edited,
          parentMessage: m.parent_message_id,
          symbol: m.symbol,
          content: m.content,
          userId: m.userId,
          giphy: m.giphy
        };
        if (roomsDict[m.roomId]) {
          roomsDict[m.roomId].messages[m.id] = message;
        }
        am[m.id] = message;
      });
      // if database didn't have negative number, mark that this field initialize,
      // so we can compare it with 0 when decreasing and get
      dbFiles.forEach(f => {
        const amElement: MessageModel = am[f.message_id];
        if (amElement) {
          const file: FileModel = {
            url: f.url,
            fileId: f.file_id,
            previewFileId: f.preview_file_id,
            sending: convertToBoolean(f.sending),
            type: f.type as BlobType,
            preview: f.preview

          };
          amElement.files![f.symbol] = file;
        }
      });

      const channelsDict: ChannelsDictModel = {};
      dbChannels.forEach((c: ChannelDB) => {
        const chm: ChannelModel = getChannelDict({
          channelId: c.id,
          channelName: c.name,
          channelCreatorId: c.creator
        });
        channelsDict[c.id] = chm;
      });
      return {roomsDict, settings, profile, channelsDict, allUsersDict};
    } else {
      return null;
    }
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

  public async clearMessages() {
    let t: SQLTransaction = await this.asyncWrite();
    t = await this.runSql(t, 'delete from file');
    t = await this.runSql(t, 'delete from message');
    this.logger.log('Db has messages removed')();
  }

  public clearStorage() {
    this.write(t => {
      this.executeSql(t, 'delete from room_users')();
      this.executeSql(t, 'delete from room')();
      this.executeSql(t, 'delete from channel')();
      this.executeSql(t, 'delete from user')();
      this.executeSql(t, 'delete from file')();
      this.executeSql(t, 'delete from message')();
      this.executeSql(t, 'delete from settings')();
      this.executeSql(t, 'delete from profile')();
      this.logger.log('Db has been cleared')();
    });
  }

  public markMessageAsSent(messageIds: number[]) {
    this.write(t => {
      this.executeSql(t, `update message set sending = 0 where id in (${messageIds.join(', ')})`, [])();
    });
  }

  // private getMessages (t, cb) {
  //   this.executeSql(t, 'SELECT * FROM message', [], (t, m) => {
  //     this.executeSql(t, 'SELECT * from file', [],  (t, i) => {
  //       let mid = {};
  //       let messages = [];
  //       for (let j = 0; j < m.rows.length; j++) {
  //         let e = m.rows[j];
  //         mid[e.id] = e;
  //         e.files = {};
  //         messages.push(e);
  //       }
  //       for (let j = 0; j < i.rows.length; j++) {
  //         let e = i.rows[j];
  //         mid[e.message_id].files[e.symbol] = e;
  //       }
  //       cb(messages);
  //     })();
  //   })();
  //   return cb;
  // }

  public insertMessage(t: SQLTransaction, message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
    this.executeSql(
        t,
        'insert or replace into message (id, time, content, symbol, deleted, giphy, edited, roomId, userId, sending, parent_message_id, thread_messages_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [message.id, message.time, message.content, message.symbol || null, message.deleted ? 1 : 0, message.giphy || null, message.edited, message.roomId, message.userId, message.sending ? 1 : 0, message.parentMessage || null, message.threadMessagesCount],
        (t, d) => {
          for (const k in message.files) {
            const f = message.files[k];
            this.executeSql(t, 'insert into file (file_id, preview_file_id, symbol, url, message_id, type, preview, sending) values ( ?, ?, ?, ?, ?, ?, ?, ?)', [ f.fileId, f.previewFileId, k, f.url, message.id, f.type, f.preview, f.sending ? 1 : 0])();
            // this.executeSql(t, 'delete from file where message_id = ? and symbol = ? ', [message.id, k], (t) => {

            // })();
          }
        }
    )();
  }

  public saveRoom(room: RoomModel) {
    this.write((t: SQLTransaction) => {
      this.setRoom(t, room);
      this.setRoomUsers(t, room.id, room.users);
    });
  }

  public saveChannel(channel: ChannelModel): void {
    this.write((t: SQLTransaction) => {
      this.setChannel(t, channel);
    });
  }

  public setChannels(channels:ChannelModel[]) {
    this.write(t => {
      this.executeSql(t, 'update channel set deleted = 1', [], (t) => {
        channels.forEach(c => this.setChannel(t, c));
      })();
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

  public insertUser(t: SQLTransaction, user: UserModel) {
    this.executeSql(t, 'insert or replace into user (id, user, sex, deleted, country_code, country, region, city) values (?, ?, ?, 0, ?, ?, ?, ?)', [user.id, user.user, convertSexToNumber(user.sex), user.location.countryCode, user.location.country, user.location.region, user.location.city])();
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
      this.executeSql(t, 'insert or replace into settings (userId, embeddedYoutube, highlightCode, incomingFileCallSound, messageSound, onlineChangeSound, sendLogs, suggestions, theme, logs) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, settings.embeddedYoutube ? 1 : 0, settings.highlightCode ? 1 : 0, settings.incomingFileCallSound ? 1 : 0, settings.messageSound ? 1 : 0, settings.onlineChangeSound ? 1 : 0, settings.sendLogs ? 1 : 0, settings.suggestions ? 1 : 0, settings.theme, settings.logs])();
    });
  }

  public deleteMessage(id: number, replaceThreadId: number) {
    this.write(t => {
      this.executeSql(t, 'delete from file where message_id = ?', [id], (t) => {
        this.executeSql(t, 'delete from message where id = ? ', [id], (t) => {
          this.executeSql(t, 'update message set parent_message_id = ? where parent_message_id = ?', [id, replaceThreadId])()
        })();
      })();
    });
  }

  public setThreadMessageCount(messageId: number, count: number): void {
    this.write(t => {
      this.executeSql(t, 'update message set thread_messages_count = ? where id = ?', [count, messageId])();
    });
  }

  public deleteRoom(id: number) {
    this.write(t => {
      this.executeSql(t, 'update room set deleted = 1 where id = ? ', [id])();
      this.executeSql(t, 'delete from room_users where room_id = ? ', [id])();
    });
  }

  public deleteChannel(id: number) {
    this.write(t => {
      this.executeSql(t, 'update channel set deleted = 1 where id = ? ', [id])();
    });
  }

  public saveRoomUsers(ru: SetRoomsUsers) {
    this.write((t: SQLTransaction) => {
      this.setRoomUsers(t, ru.roomId, ru.users);
    });
  }

  public updateRoom(r: RoomSettingsModel) {
    this.write(t => {
      this.executeSql(t, 'update room set name = ?, volume = ?, notifications = ?, p2p = ?, creator = ? where id = ? ', [r.name, r.volume, r.notifications ? 1 : 0, r.p2p ? 1 : 0, r.creator, r.id])();
    });
  }

  public saveMessages(messages: MessageModel[]) {
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

  public updateFileIds(m: SetFileIdsForMessage): void {
    this.write(t => {
      Object.keys(m.fileIds).forEach(symb => {
        this.executeSql(t, 'update file set file_id = ?, preview_file_id = ? where symbol = ? and message_id = ?', [m.fileIds[symb].fileId, m.fileIds[symb].previewFileId ?? null, symb, m.messageId])();
      });
    });
  }

  public setRoomHeaderId(roomId: number, headerId: number) {
    if (!this.cache[roomId] || this.cache[roomId] < headerId) {
      this.cache[roomId] = headerId;
    }
  }

  private executeSql(
      t: SQLTransaction,
      sql: string,
      args: unknown[] = [],
      cb: SQLStatementCallback | undefined = undefined,
      e: SQLStatementErrorCallback | undefined = undefined
  ): Function {
    const err: SQLStatementErrorCallback = e ? e : (t: SQLTransaction, e: SQLError)  => {
      this.logger.error('{} {}, error: {}, message {}', sql, args, e, e && e.message)();

      return false;
    };
    t.executeSql(sql, args, cb, err);

    return this.logger.debug('{} {}', sql, args);
  }

  private async runSql(t: SQLTransaction, sql: string): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.executeSql(t, sql, [], resolve, (t: SQLTransaction, e: SQLError) => {
        reject({sql, e});

        return false;
      })();
    });
  }

  private getStart() {
    return Promise.resolve().then(() => new Promise((resolve, reject) => {
      this.db!.changeVersion(this.db!.version, '1.0', resolve, reject);
    }));
  }

  private transaction(transactionType: TransactionType, cb: TransactionCb) {
    if (!this.db) { // TODO TypeError: undefined is not an object (evaluating 'this.db[transactionType]')
      throw Error(`${browserVersion} failed to get db`);
    }
    this.db[transactionType](
        t => {
          cb(t);
        },
        (e) => {
          this.logger.error('Error during saving message {}', e)();
        }
    );
  }

  private write(cb: TransactionCb) {
    return this.transaction('transaction', cb);
  }

  private async asyncWrite(): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.write(resolve);
    });
  }

  private setRoom(t: SQLTransaction, room: RoomSettingsModel) {
    this.executeSql(t, 'insert or replace into room (id, name, notifications, volume, deleted, channel_id, p2p, creator) values (?, ?, ?, ?, ?, ?, ?, ?)', [room.id, room.name, room.notifications ? 1 : 0, room.volume, 0, room.channelId, room.p2p ? 1 : 0, room.creator])();
  }

  private setChannel(t: SQLTransaction, channel: ChannelModel) {
    this.executeSql(t, 'insert or replace into channel (id, name, deleted, creator) values (?, ?, ?, ?)', [channel.id, channel.name, 0, channel.creator])();
  }

  private insertRoomUsers(t: SQLTransaction, roomId: number, userId: number) {
    this.executeSql(t, 'insert into room_users (room_id, user_id) values (?, ?)', [roomId, userId])();
  }

  private setRoomUsers(t: SQLTransaction, roomId: number, users: number[]) {
    this.executeSql(t, 'delete from room_users where room_id = ?', [roomId], t => {
      users.forEach(u => {
        this.insertRoomUsers(t, roomId, u);
      });
    })();
  }

}
