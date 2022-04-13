import {createConnection} from 'mysql2';
import {generateOrmConfig} from '@/utils/helpers';
import {
  CommandsRunner,
  MysqlDriver
} from 'node-db-migration';

const {database, host, password, port, username, define} = generateOrmConfig((sql) => console.log(sql))

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
    directoryWithScripts: `${__dirname}/../../config/migration/`,
  });
  await migrations.run('init')
  await migrations.run('migrate')
  await new Promise((resolve, reject) => connection.end((err) =>err ? reject() : resolve(undefined)));
});
