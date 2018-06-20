import {IStorage, Logger} from '../types';
import loggerFactory from './loggerFactory';
import {MessageModel} from '../model';
interface TransactionCb { (t: SQLTransaction, ...rest): void; }

export default class DatabaseWrapper implements IStorage {
  private logger: Logger;
  private dbName: String;
  private db: Database;
  private cache: object = {};

  constructor(dbName: String ) {
    this.logger = loggerFactory.getLogger('DB', 'color: blue; font-weight: bold');
    this.dbName = dbName;
  }


  public connect(cb: Function) {
    this.logger.log('Initializing database')();
    this.db = window.openDatabase(this.dbName, '', 'Messages database', 10 * 1024 * 1024);
    if (this.db.version === '') {
      this.db.changeVersion(this.db.version, '1.0',  (t) => {
        t.executeSql('CREATE TABLE message (id integer primary key, time integer, content text, symbol text, deleted boolean NOT NULL CHECK (deleted IN (0,1)), giphy text, edited integer, roomId integer, userId integer)', [], (t, d) => {
          t.executeSql('CREATE TABLE image (id integer primary key, symbol text, url text, message_id INTEGER REFERENCES message(id) ON UPDATE CASCADE , type text, preview text);', [],  (t, s) => {
            this.logger.log('DatabaseWrapper has been initialized with version {}', this.db.version)();
            cb(true);
          });
        });
      },  (error) => {
        this.logger.error('Error during creating database {}', error)();
        cb(false);
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