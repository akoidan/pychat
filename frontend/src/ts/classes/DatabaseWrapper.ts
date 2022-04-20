import type {
  IStorage,
  SetFileIdsForMessage,
  SetRoomsUsers,
} from "@/ts/types/types";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type {
  ChannelModel,
  ChannelsDictModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  FileModel,
  MessageModel,
  MessageStatusModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserModel,
} from "@/ts/types/model";
import {
  convertToBoolean,
  getChannelDict,
  getRoomsBaseDict,
} from "@/ts/types/converters";
import type {
  ChannelDB,
  FileDB,
  MessageDB,
  ProfileDB,
  RoomDB,
  RoomUsersDB,
  SettingsDB,
  TagDB,
  UserDB,
} from "@/ts/types/db";
import type {SetStateFromStorage} from "@/ts/types/dto";
import type {MainWindow} from "@/ts/classes/MainWindow";
import {MessageStatusInner} from "@/ts/types/model";
import {ImageType} from "@/ts/types/shared/enums";

type TransactionCb = (t: SQLTransaction, ...rest: unknown[]) => void;
type QueryObject = [string, any[]];

export default class DatabaseWrapper implements IStorage {
  private readonly logger: Logger;

  private readonly db: Database;

  private readonly cache: Record<number, number> = {};

  private readonly mainWindow: MainWindow;

  private skipSqlCache: Record<string, boolean> = {};

  public constructor(mainWindow: MainWindow) {
    this.mainWindow = mainWindow;
    if (!window.openDatabase) {
      throw Error("DatabaseWrapper not supported");
    }
    this.db = window.openDatabase("v163", "", "Messages database", 10 * 1024 * 1024);
    this.logger = loggerFactory.getLoggerColor("db", "#753e01");
  }

  public async connect(): Promise<SetStateFromStorage | null> {
    if (this.db.version === "") {
      this.logger.log("Initializing database")();
      let t: SQLTransaction = await new Promise<SQLTransaction>((resolve, reject) => {
        this.db.changeVersion(this.db.version, "1.0", resolve, reject);
      });
      t = await this.runSql(t, "CREATE TABLE user (id integer primary key, username text, sex text NOT NULL CHECK (sex IN ('MALE', 'FEMALE','OTHER')), deleted boolean NOT NULL CHECK (deleted IN (0,1)), country_code text, country text, region text, city text, thumbnail text, last_time_online integer)");
      t = await this.runSql(t, "CREATE TABLE channel (id integer primary key, name text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), creator_id INTEGER REFERENCES user(id))");
      t = await this.runSql(t, "CREATE TABLE room (id integer primary key, name text, p2p boolean NOT NULL CHECK (p2p IN (0,1)), notifications boolean NOT NULL CHECK (notifications IN (0,1)), volume integer, deleted boolean NOT NULL CHECK (deleted IN (0,1)), channel_id INTEGER REFERENCES channel(id), is_main_in_channel boolean NOT NULL CHECK (is_main_in_channel IN (0,1)), creator_id INTEGER REFERENCES user(id))");
      t = await this.runSql(t, "CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), edited integer, room_id integer REFERENCES room(id), user_id integer REFERENCES user(id), status text, parent_message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE, thread_messages_count INTEGER)");
      t = await this.runSql(t, "CREATE TABLE file (id integer primary key, sending boolean NOT NULL CHECK (sending IN (0,1)), preview_file_id integer, file_id integer, server_id integer UNIQUE, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text)");
      t = await this.runSql(t, "CREATE TABLE tag (id integer primary key, user_id INTEGER REFERENCES user(id), message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE, symbol text)");
      t = await this.runSql(t, "CREATE TABLE settings (user_id integer primary key, embedded_youtube boolean NOT NULL CHECK (embedded_youtube IN (0,1)), highlight_code boolean NOT NULL CHECK (highlight_code IN (0,1)), incoming_file_call_sound boolean NOT NULL CHECK (incoming_file_call_sound IN (0,1)), message_sound boolean NOT NULL CHECK (message_sound IN (0,1)), online_change_sound boolean NOT NULL CHECK (online_change_sound IN (0,1)), suggestions boolean NOT NULL CHECK (suggestions IN (0,1)), theme text, logs text, show_when_i_typing boolean NOT NULL CHECK (show_when_i_typing IN (0,1)))");
      t = await this.runSql(t, "CREATE TABLE profile (user_id integer primary key, username text, name text, city text, surname text, email text, birthday text, contacts text, thumbnail text, sex text NOT NULL CHECK (sex IN ('MALE','FEMALE','OTHER')))");
      t = await this.runSql(t, "CREATE TABLE room_users (room_id INTEGER REFERENCES room(id), user_id INTEGER REFERENCES user(id))");
      this.logger.log("DatabaseWrapper has been initialized")();
      return null;
    }
    this.logger.log("Created new db connection")();
    return this.getAllTree();
  }

  public async clearMessages() {
    let t: SQLTransaction = await this.asyncWrite();
    t = await this.runSql(t, "delete from file");
    t = await this.runSql(t, "delete from tag");
    t = await this.runSql(t, "delete from message");
    this.logger.log("Db has messages removed")();
  }

  public async clearStorage() {
    let t: SQLTransaction = await this.asyncWrite();
    t = await this.runSql(t, "delete from room_users");
    t = await this.runSql(t, "delete from tag");
    t = await this.runSql(t, "delete from room");
    t = await this.runSql(t, "delete from channel");
    t = await this.runSql(t, "delete from message");
    t = await this.runSql(t, "delete from user");
    t = await this.runSql(t, "delete from file");
    t = await this.runSql(t, "delete from settings");
    t = await this.runSql(t, "delete from profile");
    this.logger.log("Db has been purged")();
  }

  public markMessageAsSent(messagesIds: number[]) {
    this.write((t) => {
      this.executeSql(t, `update message set status = 'on_server' where id in ${this.idsToString(messagesIds)}`, [])();
    });
  }

  public insertMessage(t: SQLTransaction, message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
    this.executeSql(
      t,
      "insert or replace into message (id, time, content, symbol, deleted, edited, room_id, user_id, status, parent_message_id, thread_messages_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [message.id, message.time, message.content, message.symbol || null, message.deleted ? 1 : 0, message.edited, message.roomId, message.userId, message.status, message.parentMessage || null, message.threadMessagesCount],
      (t) => {
        for (const k in message.files) {
          const f = message.files[k];
          this.executeSql(t, "insert or replace into file (server_id, file_id, preview_file_id, symbol, url, message_id, type, preview, sending) values (?, ?, ?, ?, ?, ?, ?, ?, ?)", [f.serverId, f.fileId, f.previewFileId, k, f.url, message.id, f.type, f.preview, f.sending ? 1 : 0])();
          // This.executeSql(t, 'delete from file where message_id = ? and symbol = ? ', [message.id, k], (t) => {

          // })();
        }
        for (const k in message.tags) {
          const userId = message.tags[k];
          this.executeSql(t, "insert into tag (user_id, message_id, symbol) values (?, ?, ?)", [userId, message.id, k])();
          // This.executeSql(t,G 'delete from file where message_id = ? and symbol = ? ', [message.id, k], (t) => {

          // })();
        }
      },
    )();
  }

  public saveRoom(room: RoomModel) {
    this.write((t: SQLTransaction) => {
      this.executeSingle(t, this.getSetRoomQuery(t, room))();
      this.setRoomUsers(t, room.id, room.users);
    });
  }

  public saveChannel(channel: ChannelModel): void {
    this.write((t: SQLTransaction) => {
      this.setChannel(t, channel);
    });
  }

  /*
   * Public getRoomHeaderId (id: number, cb: Function) {
   *   This.read((t, id, cb ) => {
   *     This.executeSql(t, 'select min(id) as min from message where room_id = ?', [id], (t, d) => {
   *       Cb(d.rows.length ? d.rows[0].min : null);
   *     });
   *   });
   * }
   */

  /*
   * Public getIds (cb) {
   *   this.read(t => {
   *     this.executeSql(t, 'select max(id) as max, room_id, min(id) as min from message group by room_id', [],  (t, d) => {
   *       let res = {};
   *       for (let i = 0; i < d.rows.length; i++) {
   *         let e = d.rows[i];
   *         res[e.room_id] = {h: e.min, f: this.cache[e.room_id] || e.max};
   *       }
   *       cb(res);
   *     });
   *   });
   * }
   */

  public setChannels(channels: ChannelModel[]) {
    this.write((t) => {
      this.executeSql(t, "update channel set deleted = 1", [], (t) => {
        channels.forEach((c) => {
          this.setChannel(t, c);
        });
      })();
    });
  }

  public setRooms(rooms: RoomModel[]) {
    this.write((t) => {
      this.executeSql(t, "update room set deleted = 1", [], (t) => {
        this.executeMultiple(t, rooms.map((r) => this.getSetRoomQuery(t, r)))();
      })();
      this.executeSql(t, "delete from room_users", [], (t) => {
        const sqls: QueryObject[] = [];
        rooms.forEach((r) => {
          r.users.forEach((uId) => {
            sqls.push(this.getInsertRoomUsersQuery(r.id, uId));
          });
        });
        this.executeMultiple(t, sqls)();
      })();
    });
  }

  public executeSingle(t: SQLTransaction, args: QueryObject) {
    return this.executeSql(t, args[0], args[1]);
  }

  public executeMultiple(t: SQLTransaction, sqls: QueryObject[]): () => void {
    sqls.forEach((sqlArgs) => {
      this.executeSingle(t, sqlArgs);
    });
    if (sqls.length) {
      return this.logger.debug(`${sqls[0][0]} {}`, sqls.map((sql) => sql[1]));
    }
    return () => {
    };
  }

  /*
   * Private getMessages (t, cb) {
   *   this.executeSql(t, 'SELECT * FROM message', [], (t, m) => {
   *     this.executeSql(t, 'SELECT * from file', [],  (t, i) => {
   *       let mid = {};
   *       let messages = [];
   *       for (let j = 0; j < m.rows.length; j++) {
   *         let e = m.rows[j];
   *         mid[e.id] = e;
   *         e.files = {};
   *         messages.push(e);
   *       }
   *       for (let j = 0; j < i.rows.length; j++) {
   *         let e = i.rows[j];
   *         mid[e.message_id].files[e.symbol] = e;
   *       }
   *       cb(messages);
   *     })();
   *   })();
   *   return cb;
   * }
   */

  public getInsertUser(user: UserModel): QueryObject {
    return [
      "insert or replace into user (id, username, sex, deleted, country_code, country, region, city, last_time_online, thumbnail) values (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)",
      [user.id, user.username, user.sex, user.location.countryCode, user.location.country, user.location.region, user.location.city, user.lastTimeOnline, user.thumbnail],
    ];
  }

  public saveUser(user: UserModel) {
    this.write((t) => {
      this.executeSingle(t, this.getInsertUser(user));
    });
  }

  public setUsers(users: UserModel[]) {
    this.write((t) => {
      this.executeSql(t, "update user set deleted = 1", [])();
      this.executeMultiple(t, users.map((u) => this.getInsertUser(u)))();
    });
  }

  public setMessagesStatus(messagesIds: number[], status: MessageStatusModel): void {
    this.write((t) => {
      this.executeSql(t, `update message set status = ? where id in ${this.idsToString(messagesIds)}`, [status])();
    });
  }

  public setUserProfile(user: CurrentUserInfoModel) {
    this.write((t) => {
      this.executeSql(t, "insert or replace into profile (user_id, username, name, city, surname, email, birthday, contacts, sex, thumbnail) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user.id, user.username, user.name, user.city, user.surname, user.email, user.birthday, user.contacts, user.sex, user.thumbnail])();
    });
  }

  public setUserSettings(settings: CurrentUserSettingsModel) {
    this.write((t) => {
      this.executeSql(t, "insert or replace into settings (user_id, embedded_youtube, highlight_code, incoming_file_call_sound, message_sound, online_change_sound, suggestions, theme, logs, show_when_i_typing) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [1, settings.embeddedYoutube ? 1 : 0, settings.highlightCode ? 1 : 0, settings.incomingFileCallSound ? 1 : 0, settings.messageSound ? 1 : 0, settings.onlineChangeSound ? 1 : 0, settings.suggestions ? 1 : 0, settings.theme, settings.logs, settings.showWhenITyping ? 1 : 0])();
    });
  }

  public deleteMessage(id: number, replaceThreadId: number) {
    this.write((t) => {
      this.executeSql(t, "delete from file where message_id = ?", [id], (t) => {
        this.executeSql(t, "delete from tag where message_id = ?", [id], (t) => {
          this.executeSql(t, "delete from message where id = ? ", [id], (t) => {
            this.executeSql(t, "update message set parent_message_id = ? where parent_message_id = ?", [id, replaceThreadId])();
          })();
        })();
      })();
    });
  }

  public setThreadMessageCount(messageId: number, count: number): void {
    this.write((t) => {
      this.executeSql(t, "update message set thread_messages_count = ? where id = ?", [count, messageId])();
    });
  }

  public deleteRoom(id: number) {
    this.write((t) => {
      this.executeSql(t, "update room set deleted = 1 where id = ? ", [id])();
      this.executeSql(t, "delete from room_users where room_id = ? ", [id])();
    });
  }

  public deleteChannel(id: number) {
    this.write((t) => {
      this.executeSql(t, "update channel set deleted = 1 where id = ? ", [id])();
    });
  }

  public saveRoomUsers(ru: SetRoomsUsers) {
    this.write((t: SQLTransaction) => {
      this.setRoomUsers(t, ru.roomId, ru.users);
    });
  }

  public updateRoom(r: RoomSettingsModel) {
    this.write((t) => {
      this.executeSql(t, "update room set name = ?, volume = ?, notifications = ?, p2p = ?, creator_id = ?, is_main_in_channel = ?, channel_id = ? where id = ? ", [r.name, r.volume, r.notifications ? 1 : 0, r.p2p ? 1 : 0, r.creatorId, r.isMainInChannel ? 1 : 0, r.channelId, r.id])();
    });
  }

  public saveMessages(messages: MessageModel[]) {
    this.write((t) => {
      messages.forEach((m) => {
        this.insertMessage(t, m);
      });
    });
  }

  public saveMessage(m: MessageModel) {
    this.write((t) => {
      this.insertMessage(t, m);
    });
  }

  public updateFileIds(m: SetFileIdsForMessage): void {
    this.write((t) => {
      this.executeMultiple(
        t,
        m.files.map(file => [
          "update file set file_id = ?, preview_file_id = ? where symbol = ? and message_id = ?",
          [file.id, file.previewId ?? null, file.symbol, m.messageId],
        ]),
      )();
    });
  }

  public setRoomHeaderId(roomId: number, headerId: number) {
    if (!this.cache[roomId] || this.cache[roomId] < headerId) {
      this.cache[roomId] = headerId;
    }
  }

  private async getAllTree(): Promise<SetStateFromStorage | null> {
    const t: SQLTransaction = await new Promise((resolve, reject) => {
      this.db.transaction(resolve, reject);
    });

    const f: unknown[] = await Promise.all<unknown[]>([
      "select * from file",
      "select * from profile",
      "select * from room where deleted = 0",
      "select * from room_users",
      "select * from settings",
      "select * from user where deleted = 0",
      "select * from message",
      "select * from channel where deleted = 0",
      "select * from tag",
    ].map(async(sql) => new Promise((resolve, reject) => {
      this.executeSql(
        t,
        sql,
        [],
        (t: SQLTransaction, d: SQLResultSet) => {
          this.logger.debug("sql {} fetched {} ", sql, d)();
          const res: unknown[] = [];
          for (let i = 0; i < d.rows.length; i++) {
            const {rows} = d;
            res.push(rows.item(i)); // TODO does that work
          }
          resolve(res);
        },
        (t: SQLTransaction, e: SQLError) => {
          reject(e);
          return false;
        },
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
    this.logger.debug("resolved all sqls")();

    if (!dbProfile.length) {
      return null;
    }
    const profile: CurrentUserInfoModel = this.getProfileModel(dbProfile[0]);
    const settings: CurrentUserSettingsModel = this.getSettings(dbSettings[0]);
    const channelsDict: ChannelsDictModel = this.getChannels(dbChannels);
    const allUsersDict: Record<number, UserModel> = this.getUsers(dbUsers);
    const roomsDict: RoomDictModel = this.getRooms(dbRooms, dbRoomUsers, dbTags, dbMessages, dbFiles);

    return {
      settings,
      profile,
      channelsDict,
      allUsersDict,
      roomsDict,
    };
  }

  private getRooms(
    dbRooms: RoomDB[],
    dbRoomUsers: RoomUsersDB[],
    dbTags: TagDB[],
    dbMessages: MessageDB[],
    dbFiles: FileDB[],
  ): RoomDictModel {
    const roomsDict: RoomDictModel = {};
    dbRooms.forEach((r: RoomDB) => {
      const rm: RoomModel = getRoomsBaseDict({
        id: r.id,
        p2p: convertToBoolean(r.p2p),
        notifications: convertToBoolean(r.notifications),
        isMainInChannel: convertToBoolean(r.is_main_in_channel),
        name: r.name,
        channelId: r.channel_id,
        creatorId: r.creator_id,
        users: [],
        volume: r.volume,
      });
      roomsDict[r.id] = rm;
    });
    dbRoomUsers.forEach((ru) => {
      roomsDict[ru.room_id].users.push(ru.user_id);
    });


    const messageTags: Record<string, Record<string, number>> = {};
    dbTags.forEach((a) => {
      if (!messageTags[a.message_id]) {
        messageTags[a.message_id] = {};
      }
      messageTags[a.message_id][a.symbol] = a.user_id;
    });

    const am: Record<string, MessageModel> = {};
    dbMessages.forEach((m) => {
      const tags = messageTags[m.id] ? messageTags[m.id] : {};
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
        transfer: m.status === MessageStatusInner.SENDING ? {
          error: null,
          abortFn: null,
          upload: null,
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

    /*
     * If database didn't have negative number, mark that this field initialize,
     * so we can compare it with 0 when decreasing and get
     */
    dbFiles.forEach((f) => {
      const amElement: MessageModel = am[f.message_id];
      if (amElement) {
        const file: FileModel = {
          url: f.url,
          fileId: f.file_id,
          serverId: f.server_id,
          previewFileId: f.preview_file_id,
          sending: convertToBoolean(f.sending),
          type: f.type as ImageType,
          preview: f.preview,

        };
        amElement.files![f.symbol] = file;
      }
    });
    return roomsDict;
  }

  private getUsers(dbUsers: UserDB[]): Record<number, UserModel> {
    const allUsersDict: Record<number, UserModel> = {};
    dbUsers.forEach((u) => {
      const user: UserModel = {
        id: u.id,
        lastTimeOnline: u.last_time_online,
        sex: u.sex,
        thumbnail: u.thumbnail,
        username: u.username,
        location: {
          region: u.region,
          city: u.city,
          countryCode: u.country_code,
          country: u.country,
        },
      };
      allUsersDict[u.id] = user;
    });
    return allUsersDict;
  }

  private getChannels(dbChannels: ChannelDB[]): ChannelsDictModel {
    const channelsDict: ChannelsDictModel = {};
    dbChannels.forEach((c: ChannelDB) => {
      const chm: ChannelModel = getChannelDict({
        id: c.id,
        name: c.name,
        creatorId: c.creator_id,
      });
      channelsDict[c.id] = chm;
    });
    return channelsDict;
  }

  private getSettings(dbSettings: SettingsDB): CurrentUserSettingsModel {
    return {
      embeddedYoutube: convertToBoolean(dbSettings.embedded_youtube),
      highlightCode: convertToBoolean(dbSettings.highlight_code),
      incomingFileCallSound: convertToBoolean(dbSettings.incoming_file_call_sound),
      messageSound: convertToBoolean(dbSettings.message_sound),
      showWhenITyping: convertToBoolean(dbSettings.show_when_i_typing),
      onlineChangeSound: convertToBoolean(dbSettings.online_change_sound),
      suggestions: convertToBoolean(dbSettings.suggestions),
      theme: dbSettings.theme,
      logs: dbSettings.logs,
    };
  }

  private getProfileModel(dbProfile: ProfileDB): CurrentUserInfoModel {
    return {
      sex: dbProfile.sex,
      contacts: dbProfile.contacts,
      thumbnail: dbProfile.thumbnail,
      birthday: dbProfile.birthday,
      email: dbProfile.email,
      surname: dbProfile.surname,
      city: dbProfile.city,
      name: dbProfile.name,
      id: dbProfile.user_id,
      username: dbProfile.username,
    };
  }

  private idsToString(ids: number[]): string {
    return `(${ids.join(", ")})`;
  }

  private setRoomUsers(t: SQLTransaction, roomId: number, users: number[]) {
    this.executeSql(t, "delete from room_users where room_id = ?", [roomId], (t) => {
      const sqls = users.map((u) => this.getInsertRoomUsersQuery(roomId, u));
      this.executeMultiple(t, sqls)();
    })();
  }

  private getInsertRoomUsersQuery(roomId: number, userId: number): QueryObject {
    return ["insert into room_users (room_id, user_id) values (?, ?)", [roomId, userId]];
  }

  private executeSql(
    t: SQLTransaction,
    sql: string,
    args: unknown[] = [],
    cb: SQLStatementCallback | undefined = undefined,
    e: SQLStatementErrorCallback | undefined = undefined,
  ): Function {
    const err: SQLStatementErrorCallback = e ? e : (t: SQLTransaction, e: SQLError) => {
      this.logger.error("{} {}, error: {}, message {}", sql, args, e, e && e.message)();

      return false;
    };
    t.executeSql(sql, args, cb, err);
    return this.logQuery(this, sql, this.logger.debug("{} {}", sql, args));
  }

  private async runSql(t: SQLTransaction, sql: string): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.executeSql(t, sql, [], resolve, (t: SQLTransaction, e: SQLError) => {
        reject({
          sql,
          e,
        });

        return false;
      })();
    });
  }

  private write(cb: TransactionCb) {
    if (!this.mainWindow.isTabMain()) {
      const that = this;
      cb({
        executeSql(sql: string, args: any[]) {
          that.logQuery(that, sql, that.logger.warn("Skipping sql {} with args {}, since this is not a main tab", sql, args))();
        },
      });
      return;
    }
    this.db.transaction(
      (t) => {
        cb(t);
      },
      (e) => {
        this.logger.error("Error during saving message {}", e)();
      },
    );
  }

  private logQuery(that: this, sql: string, logFn: () => void): () => void {
    if (that.skipSqlCache[sql]) {
      return () => () => {
      };
    }
    that.skipSqlCache[sql] = true;
    setTimeout(() => {
      that.skipSqlCache[sql] = false;
    }, 1000);

    /*
     * Prevent spam
     * @ts-ignore
     */
    return logFn;
  }

  private async asyncWrite(): Promise<SQLTransaction> {
    return new Promise<SQLTransaction>((resolve, reject) => {
      this.write(resolve);
    });
  }

  private getSetRoomQuery(t: SQLTransaction, room: RoomSettingsModel): QueryObject {
    return ["insert or replace into room (id, name, notifications, volume, deleted, channel_id, p2p, creator_id, is_main_in_channel) values (?, ?, ?, ?, ?, ?, ?, ?, ?)", [room.id, room.name, room.notifications ? 1 : 0, room.volume, 0, room.channelId, room.p2p ? 1 : 0, room.creatorId, room.isMainInChannel ? 1 : 0]];
  }

  private setChannel(t: SQLTransaction, channel: ChannelModel) {
    this.executeSql(t, "insert or replace into channel (id, name, deleted, creator_id) values (?, ?, ?, ?)", [channel.id, channel.name, 0, channel.creatorId])();
  }
}
