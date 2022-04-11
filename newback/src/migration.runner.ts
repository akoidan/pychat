import {createConnection} from 'mysql2';
import {generateConfig} from '@/data/database/ormconfig';
import {
  CommandsRunner,
  MysqlDriver
} from 'node-db-migration';

const {database, host, password, port, username, define} = generateConfig((sql) => console.log(sql))

const connection = createConnection({
  database,
  host,
  password,
  port,
  user: username,
  multipleStatements: true,
  charset: define.charset,
  connectAttributes: {
    'collate': define.collate
  }
});

connection.connect(async function (err) {
  let migrations = new CommandsRunner({
    driver: new MysqlDriver(connection),
    directoryWithScripts: `${__dirname}/../config/migration/`,
  });
  await migrations.run('init')
  await migrations.run('migrate')
});
