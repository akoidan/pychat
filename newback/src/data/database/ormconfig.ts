import { ConsoleLogger } from '@nestjs/common';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { config } from 'node-config-ts';

const {
  host, port, username, password, database, logging, synchronize,
} = config.mysql;

const logger = new ConsoleLogger('sql');
export const ormconfig: SequelizeModuleOptions = {
  synchronize,
  sync: {
    force: true,
  },
  logging: logging ? (sql: string): void => logger.debug(sql) : false,
  dialect: 'mysql',
  host,
  port,
  username,
  password,
  database,
  autoLoadModels: true,
  define: {
    charset: 'utf8mb4',
    paranoid: true,
    timestamps: true,
   freezeTableName: true,
    underscored: true,
  }
};

