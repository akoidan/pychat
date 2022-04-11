import type {SequelizeModuleOptions} from '@nestjs/sequelize';
import {config} from 'node-config-ts';


export function generateConfig(logging: ((sql: string) => void)): Omit<SequelizeModuleOptions, 'ssl'> {
  return {
    synchronize: config.mysql.synchronize,
    logging: config.mysql.logging ? logging : false,
    dialect: 'mysql',
    host: config.mysql.host,
    port: config.mysql.port,
    username: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    autoLoadModels: true,
    sync: {
      force: true,
    },
    define: {
      collate: 'utf8mb4_general_ci',
      charset: 'utf8mb4',
      paranoid: true,
      timestamps: true,
      underscored: true,
    }
  };
}

