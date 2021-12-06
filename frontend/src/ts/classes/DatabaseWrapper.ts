import {
  IStorage,
  SetFileIdsForMessage,
  SetRoomsUsers,
} from '@/ts/types/types';
import loggerFactory from '@/ts/instances/loggerFactory';
import {Logger} from 'lines-logger';
import {
  BlobType,
  ChannelModel,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  MessageModel,
  MessageStatus,
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
  TagDB,
  UserDB
} from '@/ts/types/db';
import {SetStateFromStorage} from '@/ts/types/dto';
import {MainWindow} from '@/ts/classes/MainWindow';

type TransactionCb = (t: SQLTransaction, ...rest: unknown[]) => void;
type QueryObject = [string, any[]];

export default class DatabaseWrapper implements IStorage {
  private readonly logger: Logger;
  private readonly db: Database;
  private readonly cache: { [id: number]: number } = {};
  private mainWindow: MainWindow;
  private skipSqlCache: Record<string, boolean> = {}

  constructor(mainWindow: MainWindow) {
    this.mainWindow = mainWindow;
    if (!window.openDatabase) {
      throw Error("DatabaseWrapper not supported")
    }
    this.db = window.openDatabase('v157', '', 'Messages database', 10 * 1024 * 1024);
    this.logger = loggerFactory.getLoggerColor(`db`, '#753e01');
  }

  public async connect(): Promise<SetStateFromStorage|null> {
    if (this.db.version === '') {
      this.logger.log('Initializing database')();
      let t: SQLTransaction = await new Promise<SQLTransaction>((resolve, reject) => {
        this.db.changeVersion(this.db.version, '1.0', resolve, reject);
      });
      t = await this.runSql(t, 'CREATE TABLE user (id integer primary key, user text, sex integer NOT NULL CHECK (sex IN (0,1,2)), deleted boolean NOT NULL CHECK (deleted IN (0,1)), country_code text, country text, region text, city text, thumbnail text, last_time_online integer)');
      t = await this.runSql(t, 'CREATE TABLE channel (id integer primary key, name text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), creator INTEGER REFERENCES user(id))');
      t = await this.runSql(t, 'CREATE TABLE room (id integer primary key, name text, p2p boolean NOT NULL CHECK (p2p IN (0,1)), notifications boolean NOT NULL CHECK (notifications IN (0,1)), volume integer, deleted boolean NOT NULL CHECK (deleted IN (0,1)), channel_id INTEGER REFERENCES channel(id), is_main_in_channel boolean NOT NULL CHECK (is_main_in_channel IN (0,1)), creator INTEGER REFERENCES user(id))');
      t = await this.runSql(t, 'CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), edited integer, room_id integer REFERENCES room(id), user_id integer REFERENCES user(id), status text, parent_message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE, thread_messages_count INTEGER)');
      t = await this.runSql(t, 'CREATE TABLE file (id integer primary key, sending boolean NOT NULL CHECK (sending IN (0,1)), preview_file_id integer, file_id integer, server_id integer UNIQUE, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text)');
      t = await this.runSql(t, 'CREATE TABLE tag (id integer primary key, user_id INTEGER REFERENCES user(id), message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE, symbol text)');
      t = await this.runSql(t, 'CREATE TABLE settings (user_id integer primary key, embedded_youtube boolean NOT NULL CHECK (embedded_youtube IN (0,1)), highlight_code boolean NOT NULL CHECK (highlight_code IN (0,1)), incoming_file_call_sound boolean NOT NULL CHECK (incoming_file_call_sound IN (0,1)), message_sound boolean NOT NULL CHECK (message_sound IN (0,1)), online_change_sound boolean NOT NULL CHECK (online_change_sound IN (0,1)), send_logs boolean NOT NULL CHECK (send_logs IN (0,1)), suggestions boolean NOT NULL CHECK (suggestions IN (0,1)), theme text, logs text, show_when_i_typing boolean NOT NULL CHECK (show_when_i_typing IN (0,1)))');
      t = await this.runSql(t, 'CREATE TABLE profile (user_id integer primary key, user text, name text, city text, surname text, email text, birthday text, contacts text, image text, sex integer NOT NULL CHECK (sex IN (0,1,2)))');
      t = await this.runSql(t, 'CREATE TABLE room_users (room_id INTEGER REFERENCES room(id), user_id INTEGER REFERENCES user(id))');
      this.logger.log('DatabaseWrapper has been initialized')();
      return null;
    } else {
      this.logger.log('Created new db connection')();
      return this.getAllTree();

    }
  }

  private async getAllTree(): Promise<SetStateFromStorage|null> {
    const t: SQLTransaction  = await new Promise((resolve, reject) => this.db.transaction(resolve, reject));

    const f: unknown[][] = await Promise.all<unknown[]>([
      'select * from file',
      'select * from profile',
      'select * from room where deleted = 0',
      'select * from room_users',
      'select * from settings',
      'select * from user where deleted = 0',
      'select * from message',
      'select * from channel where deleted = 0',
      'select * from tag'
    ].map(sql => new Promise((resolve, reject) => {
      this.executeSql(
        t,
        sql,
        [],
        (t: SQLTransaction, d: SQLResultSet) => {
          this.logger.debug('sql {} fetched {} ', sql, d)();
          const res: unknown[] = [];
          for (let i = 0; i < d.rows.length; i++) {
            const rows: SQLResultSetRowList = d.rows;
            res.push(rows.item(i)); // TODO does that work
          }
          resolve(res);
        }, (t: SQLTransaction, e: SQLError) => {
          reject(e);
          return false;
        }
      )();
    })));

    const dbFiles: FileDB[] = f[0] as FileDB[],
        dbProfile: ProfileDB[] = f[1] as ProfileDB[],
        dbRooms: RoomDB[] = f[2] as RoomDB[],
        dbRoomUsers: RoomUsersDB[] = f[3] as RoomUsersDB[],
        dbSettings: SettingsDB[] = f[4] as SettingsDB[],
        dbUsers: UserDB[] = f[5] as UserDB[],
        dbMessages: MessageDB[] = f[6] as MessageDB[],
        dbChannels: ChannelDB[] = f[7] as ChannelDB[],
        dbTags: TagDB[] = f[8] as TagDB[];
    this.logger.debug('resolved all sqls')();

    if (!dbProfile.length) {
      return null
    }
    const profile: CurrentUserInfoModel = this.getProfileModel(dbProfile[0]);
    const settings: CurrentUserSettingsModel = this.getSettings(dbSettings[0]);
    const channelsDict: ChannelsDictModel = this.getChannels(dbChannels);
    const allUsersDict: { [id: number]: UserModel } = this.getUsers(dbUsers);
    const roomsDict: RoomDictModel = this.getRooms(dbRooms, dbRoomUsers, dbTags, dbMessages, dbFiles);

    return  { settings, profile, channelsDict, allUsersDict, roomsDict};
  }

  private getRooms(
      dbRooms: RoomDB[],
      dbRoomUsers: RoomUsersDB[],
      dbTags: TagDB[],
      dbMessages: MessageDB[],
      dbFiles: FileDB[]
  ): RoomDictModel {
    const roomsDict: RoomDictModel = {};
    dbRooms.forEach((r: RoomDB) => {
      const rm: RoomModel = getRoomsBaseDict({
        roomId: r.id,
        p2p: convertToBoolean(r.p2p),
        notifications: convertToBoolean(r.notifications),
        isMainInChannel: convertToBoolean(r.is_main_in_channel),
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


    let messageTags: Record<string, Record<string, number>> = {};
    dbTags.forEach(a => {
      if (!messageTags[a.message_id]) {
        messageTags[a.message_id] = {};
      }
      messageTags[a.message_id][a.symbol] = a.user_id;
    });

    const am: Record<string, MessageModel> = {};
    dbMessages.forEach(m => {
      let tags = messageTags[m.id] ? messageTags[m.id] : {};
      const message: MessageModel = {
        id: m.id,
        roomId: m.room_id,
        isHighlighted: false,
        time: m.time,
        isEditingActive: false,
        isThreadOpened: false,
        threadMessagesCount: m.thread_messages_count,
        deleted: convertToBoolean(m.deleted),
        tags,
        transfer: m.status === 'sending' ? {
          error: null,
          xhr: null,
          upload: null
        } : null,
        files: {},
        status: m.status,
        edited: m.edited,
        parentMessage: m.parent_message_id,
        symbol: m.symbol,
        content: m.content,
        userId: m.user_id,
      };
      if (roomsDict[m.room_id]) {
        roomsDict[m.room_id].messages[m.id] = message;
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
          serverId: f.server_id,
          previewFileId: f.preview_file_id,
          sending: convertToBoolean(f.sending),
          type: f.type as BlobType,
          preview: f.preview

        };
        amElement.files![f.symbol] = file;
      }
    });
    return roomsDict;
  }

  private getUsers(dbUsers: UserDB[]): { [id: number]: UserModel } {
    const allUsersDict: { [id: number]: UserModel } = {};
    dbUsers.forEach(u => {
      const user: UserModel = {
        id: u.id,
        lastTimeOnline: u.last_time_online,
        sex: convertNumberToSex(u.sex),
        image: u.thumbnail,
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
    return allUsersDict;
  }

  private getChannels(dbChannels: ChannelDB[]): ChannelsDictModel {
    const channelsDict: ChannelsDictModel = {};
    dbChannels.forEach((c: ChannelDB) => {
      const chm: ChannelModel = getChannelDict({
        channelId: c.id,
        channelName: c.name,
        channelCreatorId: c.creator
      });
      channelsDict[c.id] = chm;
    });
    return channelsDict;
  }

  private getSettings(dbSettings: SettingsDB): CurrentUserSettingsModel {
    return  {
      embeddedYoutube: convertToBoolean(dbSettings.embedded_youtube),
      highlightCode: convertToBoolean(dbSettings.highlight_code),
      incomingFileCallSound: convertToBoolean(dbSettings.incoming_file_call_sound),
      messageSound: convertToBoolean(dbSettings.message_sound),
      showWhenITyping: convertToBoolean(dbSettings.show_when_i_typing),
      onlineChangeSound: convertToBoolean(dbSettings.online_change_sound),
      sendLogs: convertToBoolean(dbSettings.send_logs),
      suggestions: convertToBoolean(dbSettings.suggestions),
      theme: dbSettings.theme,
      logs: dbSettings.logs,
    };
  }

  private getProfileModel(dbProfile: ProfileDB): CurrentUserInfoModel {
    return {
      sex: convertSexToString(dbProfile.sex),
      contacts: dbProfile.contacts,
      image: dbProfile.image,
      birthday: dbProfile.birthday,
      email: dbProfile.email,
      surname: dbProfile.surname,
      city: dbProfile.city,
      name: dbProfile.name,
      userId: dbProfile.user_id,
      user: dbProfile.user
    };
  }

// public getRoomHeaderId (id: number, cb: Function) {
  //   this.read((t, id, cb ) => {
  //     this.executeSql(t, 'select min(id) as min from message where room_id = ?', [id], (t, d) => {
  //       cb(d.rows.length ? d.rows[0].min : null);
  //     });
  //   });
  // }

  // public getIds (cb) {
  //   this.read(t => {
  //     this.executeSql(t, 'select max(id) as max, room_id, min(id) as min from message group by room_id', [],  (t, d) => {
  //       let res = {};
  //       for (let i = 0; i < d.rows.length; i++) {
  //         let e = d.rows[i];
  //         res[e.room_id] = {h: e.min, f: this.cache[e.room_id] || e.max};
  //       }
  //       cb(res);
  //     });
  //   });
  // }

  public async clearMessages() {
    let t: SQLTransaction = await this.asyncWrite();
    t = await this.runSql(t, 'delete from file');
    t = await this.runSql(t, 'delete from tag');
    t = await this.runSql(t, 'delete from message');
    this.logger.log('Db has messages removed')();
  }

  public async clearStorage() {
    let t: SQLTransaction = await this.asyncWrite();
    t = await this.runSql(t, 'delete from room_users');
    t = await this.runSql(t, 'delete from tag');
    t = await this.runSql(t, 'delete from room');
    t = await this.runSql(t, 'delete from channel');
    t = await this.runSql(t, 'delete from message');
    t = await this.runSql(t, 'delete from user');
    t = await this.runSql(t, 'delete from file');
    t = await this.runSql(t, 'delete from settings');
    t = await this.runSql(t, 'delete from profile');
    this.logger.log('Db has been purged')();
  }

  public markMessageAsSent(messagesIds: number[]) {
    this.write(t => {
      this.executeSql(t, `update message set status = 'on_server' where id in ${this.idsToString(messagesIds)}`, [])();
    });
  }

  private idsToString(ids: number[]): string {
    return `(${ids.join(', ')})`;
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
        'insert or replace into message (id, time, content, symbol, deleted, edited, room_id, user_id, status, parent_message_id, thread_messages_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [message.id, message.time, message.content, message.symbol || null, message.deleted ? 1 : 0, message.edited, message.roomId, message.userId, message.status, message.parentMessage || null, message.threadMessagesCount],
        (t, d) => {
          for (const k in message.files) {
            const f = message.files[k];
            this.executeSql(t, 'insert or replace into file (server_id, file_id, preview_file_id, symbol, url, message_id, type, preview, sending) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [f.serverId, f.fileId, f.previewFileId, k, f.url, message.id, f.type, f.preview, f.sending ? 1 : 0])();
            // this.executeSql(t, 'delete from file where message_id = ? and symbol = ? ', [message.id, k], (t) => {

            // })();
          }
          for (const k in message.tags) {
            const userId = message.tags[k];
            this.executeSql(t, 'insert into tag (user_id, message_id, symbol) values (?, ?, ?)', [userId, message.id, k])();
            // this.executeSql(t, 'delete from file where message_id = ? and symbol = ? ', [message.id, k], (t) => {

            // })();
          }
        }
    )();
  }

  public saveRoom(room: RoomModel) {
    this.write((t: SQLTransaction) => {
      this.executeSingle(t, this.getSetRoomQuery(t, room))()
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
        this.executeMultiple(t, rooms.map(r => this.getSetRoomQuery(t, r)))();
      })();
      this.executeSql(t, 'delete from room_users', [], (t) => {
        let sqls: QueryObject[] = [];
        rooms.forEach(r => {
          r.users.forEach(uId => {
            sqls.push(this.getInsertRoomUsersQuery(r.id, uId))
          });
        });
        this.executeMultiple(t, sqls)();
      })();
    });
  }


  public executeSingle(t: SQLTransaction, args: QueryObject) {
    return this.executeSql(t, args[0], args[1])
  }

  public executeMultiple(t: SQLTransaction, sqls: QueryObject[]): ()  => void {
    sqls.forEach(sqlArgs => {
      this.executeSingle(t, sqlArgs)
    })
    if (sqls.length) {
      return this.logger.debug(`${sqls[0][0]} {}`, sqls.map(sql => sql[1]))
    } else {
      return () => {}
    }
  }

  private setRoomUsers(t: SQLTransaction, roomId: number, users: number[]) {
    this.executeSql(t, 'delete from room_users where room_id = ?', [roomId], t => {
      let sqls = users.map(u => this.getInsertRoomUsersQuery(roomId, u));
      this.executeMultiple(t, sqls)();
    })();
  }

  private getInsertRoomUsersQuery(roomId: number, userId: number): QueryObject {
    return [`insert into room_users (room_id, user_id) values (?, ?)`, [roomId, userId]];
  }

  public getInsertUser(user: UserModel): QueryObject {
    return ['insert or replace into user (id, user, sex, deleted, country_code, country, region, city, last_time_online, thumbnail) values (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)',
        [user.id, user.user, convertSexToNumber(user.sex), user.location.countryCode, user.location.country, user.location.region, user.location.city, user.lastTimeOnline, user.image]
    ]
  }

  public saveUser(user: UserModel) {
    this.write(t => {
      this.executeSingle(t, this.getInsertUser(user))
    })
  }

  public setUsers(users: UserModel[]) {
    this.write(t => {
      this.executeSql(t, 'update user set deleted = 1', [])();
      this.executeMultiple(t, users.map(u => this.getInsertUser(u)))()
    });
  }

  public setMessagesStatus(messagesIds: number[], status: MessageStatus): void {
    this.write(t => {
      this.executeSql(t, `update message set status = ? where id in ${this.idsToString(messagesIds)}`, [status])();
    });
  }

  public setUserProfile(user: CurrentUserInfoModel) {
    this.write(t => {
      this.executeSql(t, 'insert or replace into profile (user_id, user, name, city, surname, email, birthday, contacts, sex, image) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.userId, user.user, user.name, user.city, user.surname, user.email, user.birthday, user.contacts, convertStringSexToNumber(user.sex), user.image])();
    });
  }

  public setUserSettings(settings: CurrentUserSettingsModel) {
    this.write(t => {
      this.executeSql(t, 'insert or replace into settings (user_id, embedded_youtube, highlight_code, incoming_file_call_sound, message_sound, online_change_sound, send_logs, suggestions, theme, logs, show_when_i_typing) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, settings.embeddedYoutube ? 1 : 0, settings.highlightCode ? 1 : 0, settings.incomingFileCallSound ? 1 : 0, settings.messageSound ? 1 : 0, settings.onlineChangeSound ? 1 : 0, settings.sendLogs ? 1 : 0, settings.suggestions ? 1 : 0, settings.theme, settings.logs, settings.showWhenITyping ? 1 : 0])();
    });
  }

  public deleteMessage(id: number, replaceThreadId: number) {
    this.write(t => {
      this.executeSql(t, 'delete from file where message_id = ?', [id], (t) => {
        this.executeSql(t, 'delete from tag where message_id = ?', [id], (t) => {
          this.executeSql(t, 'delete from message where id = ? ', [id], (t) => {
            this.executeSql(t, 'update message set parent_message_id = ? where parent_message_id = ?', [id, replaceThreadId])()
          })()
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
      this.executeSql(t, 'update room set name = ?, volume = ?, notifications = ?, p2p = ?, creator = ?, is_main_in_channel = ?, channel_id = ? where id = ? ', [r.name, r.volume, r.notifications ? 1 : 0, r.p2p ? 1 : 0, r.creator, r.isMainInChannel ? 1: 0, r.channelId, r.id])();
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
      this.executeMultiple(
          t,
          Object.keys(m.fileIds)
              .map(symb => [
                  'update file set file_id = ?, preview_file_id = ? where symbol = ? and message_id = ?',
                [m.fileIds[symb].fileId, m.fileIds[symb].previewFileId ?? null, symb, m.messageId]
              ])
      )();
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
    return this.logQuery(this, sql, this.logger.debug('{} {}', sql, args));
  }

  private async runSql(t: SQLTransaction, sql: string): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.executeSql(t, sql, [], resolve, (t: SQLTransaction, e: SQLError) => {
        reject({sql, e});

        return false;
      })();
    });
  }

  private write(cb: TransactionCb) {
    if (!this.mainWindow.isTabMain()) {
      const that = this;
      cb({executeSql(sql: string, args: any[]) {
          that.logQuery(that, sql, that.logger.warn('Skipping sql {} with args {}, since this is not a main tab', sql, args))();
        }})
      return
    }
    this.db.transaction(
        t => {
          cb(t);
        },
        (e) => {
          this.logger.error('Error during saving message {}', e)();
        }
    );
  }

  private logQuery(that: this, sql: string, logFn: () => void) : () => void {
    if (that.skipSqlCache[sql]) {
      return () => () => {};
    }
    that.skipSqlCache[sql] = true;
    setTimeout(() => {
      that.skipSqlCache[sql] = false;
    }, 1000);
    // prevent spam
    // @ts-ignore
    return logFn;
  }

  private async asyncWrite(): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.write(resolve);
    });
  }

  private getSetRoomQuery(t: SQLTransaction, room: RoomSettingsModel): QueryObject {
    return ['insert or replace into room (id, name, notifications, volume, deleted, channel_id, p2p, creator, is_main_in_channel) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [room.id, room.name, room.notifications ? 1 : 0, room.volume, 0, room.channelId, room.p2p ? 1 : 0, room.creator, room.isMainInChannel ? 1: 0]]
  }

  private setChannel(t: SQLTransaction, channel: ChannelModel) {
    this.executeSql(t, 'insert or replace into channel (id, name, deleted, creator) values (?, ?, ?, ?)', [channel.id, channel.name, 0, channel.creator])();
  }

}
