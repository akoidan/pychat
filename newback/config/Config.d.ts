/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    name: string
    application: Application
    settings: Settings
    redis: Redis
    frontend: Frontend
    mysql: Mysql
  }
  interface Mysql {
    synchronize: boolean
    logging: boolean
    dialect: string
    host: string
    "default-character-set": string
    port: number
    username: string
    password: string
    database: string
  }
  interface Frontend {
    address: string
    maxUserNameLength: number
    jsConsoleLogs: string
    maxMessageSize: number
    issueReportLink: string
    chromeExtension: ChromeExtension
  }
  interface ChromeExtension {
    id: string
    url: string
  }
  interface Redis {
    host: string
    port: number
    database: number
  }
  interface Settings {
    wsIdCharLength: number
    allRedisRoom: string
    allRoomId: number
    showCountryCode: boolean
    firebaseUrl: string
    ipApiUrl: string
    pingCloseJsDelay: number
    pingInterval: number
    clientNoServerPingCloseTimeout: number
  }
  interface Application {
    env: string
    port: number
    logLevel: string
    logOutput: string
    crtPath: string
    keyPath: string
  }
  export const config: Config
  export type Config = IConfig
}
