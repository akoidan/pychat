import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
};

export default async(): Promise<Config.InitialOptions> => {
  return {
    globals: {
      'ts-jest': {
        compiler: 'ttypescript'
      },
    },
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "globalSetup": "./jest.setup.ts",
    "modulePathIgnorePatterns": [
      "e2e.spec.ts"
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
  }
};
