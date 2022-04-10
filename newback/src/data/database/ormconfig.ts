import type {SequelizeModuleOptions} from '@nestjs/sequelize';
import {config} from 'node-config-ts';


export function generateConfig(logging: ((sql: string) => void)): SequelizeModuleOptions {
  return {
    synchronize: config.mysql.synchronize,
    sync: {
      force: true,
    },
    logging: config.mysql.logging ? logging : false,
    dialect: 'mysql',
    host: config.mysql.host,
    port: config.mysql.port,
    username: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    autoLoadModels: true,
    define: {
      collate: 'utf8mb4_general_ci',
      charset: 'utf8mb4',
      paranoid: true,
      timestamps: true,
      freezeTableName: true,
      underscored: true,
    }
  };
}

