import type {SequelizeModuleOptions} from "@nestjs/sequelize";

import {MAX_USERNAME_LENGTH} from "@/utils/consts";
import {config} from "node-ts-config";

export function generateUserName(email: string) {
  return email.split("@")[0].replace(/[^0-9a-zA-Z-_]+/g, "-").substring(0, MAX_USERNAME_LENGTH);
}

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

