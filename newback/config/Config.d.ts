/* tslint:disable */
/* eslint-disable */
declare module "node-ts-config" {
  interface IConfig {
    name: string
    application: Application
    settings: Settings
    auth: Auth
    recaptcha: Recaptcha
    email: Email
    redis: Redis
    frontend: Frontend
    mysql: Mysql
  }
  interface Mysql {
    synchronize: boolean
    logging: boolean
    host: string
    port: number
    username: string
    password: string
    database: string
  }
  interface Frontend {
    address: string
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
  interface Email {
    host: string
    port: number
    auth: Auth2
    from: string
  }
  interface Auth2 {
    type: string
    user: string
    password: string
  }
  interface Recaptcha {
    publicKey: string
    privateKey: string
  }
  interface Auth {
    google: Google
  }
  interface Google {
    clientId: string
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
