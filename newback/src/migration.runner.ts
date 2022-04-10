import mysql2 from 'mysql2';
import {CommandsRunner, MysqlDriver} from 'node-db-migration';
var connection = mysql2.createConnection({
    "host" : "localhost",
    "user" : "root",
    "database" : "test8",
    "multipleStatements" : true, // if you have multiple sql in your scripts
});
connection.connect(function(err) {
    let migrations = new CommandsRunner({
        driver: new MysqlDriver(connection),
        directoryWithScripts: __dirname + '/diff',
    });
    migrations.run('init')
});
