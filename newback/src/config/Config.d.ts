/* eslint-disable */
declare module "node-ts-config" {
  interface IConfig {
    name: string
    application: Application
    settings: Settings
    redis: Redis
    frontend: Frontend
    mysql: Mysql
    auth: Auth
    recaptcha: Recaptcha
    email: Email
  }
  interface Email {
    host: string
    port: number
    secure: boolean
    auth: Auth2
  }
  interface Auth2 {
    user: string
    pass: string
  }
  interface Recaptcha {
    publicKey: string
    privateKey: string
  }
  interface Auth {
    google: Google
    facebook: Facebook
  }
  interface Facebook {
    accessToken: string
  }
  interface Google {
    clientId: string
  }
  interface Mysql {
    host: string
    port: number
    username: string
    password: string
    database: string
    logging: boolean
  }
  interface Frontend {
    address: string
    issueReportLink: string
  }
  interface Redis {
    host: string
    port: number
    database: number
  }
  interface Settings {
    flags: boolean
  }
  interface Application {
    port: number
    ssl: Ssl
  }
  interface Ssl {
    crtPath: string
    keyPath: string
  }
  export const config: Config
  export type Config = IConfig
}
