import type {SequelizeModuleOptions} from "@nestjs/sequelize";

import {config} from "node-ts-config";


export function generateOrmConfig(logging: ((sql: string) => void)): Omit<SequelizeModuleOptions, "ssl"> {
  const sync = false;
  // Drop database pychat2; create database pychat2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci; GRANT ALL ON pychat2.* TO 'pychat'@'localhost';
  return {
    synchronize: sync,
    logging,
    dialect: "mysql",
    host: config.mysql.host,
    port: config.mysql.port,
    username: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    autoLoadModels: true,
    sync: {
      force: sync,
    },
    query: {
      nest: !sync,
      // Raw: true,
    },
    define: {
      collate: "utf8mb4_general_ci",
      charset: "utf8mb4",
      paranoid: true,
      timestamps: true,
      underscored: true,
    },
  };
}


