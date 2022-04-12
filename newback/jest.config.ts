import type {Config} from '@jest/types';
const tsconfig = require("./tsconfig.json")
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig)

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
};

export default async(): Promise<Config.InitialOptions> => {
  return {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/coverage/",
      "/ormconfig.ts",
      "/jest.config.ts",
      "/dist/",
      ".module.ts$",
      ".dto.ts$"
    ],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
    moduleNameMapper,
  }
};
