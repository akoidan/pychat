import type {Config} from "@jest/types";

/*
 * Sync object
 * jest should be inside of src directory, otherwise tsc will compile it, and will make src directory in build
 * which will fail node-ts-config along with __dirname for photos and etc
 */
const config: Config.InitialOptions = {
  verbose: true,
};

export default async(): Promise<Config.InitialOptions> => ({
  rootDir: '../',
  globals: {
    "ts-jest": {
      compiler: "ttypescript",
    },
  },
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
  ],
  globalSetup: "./utils/jest.setup.ts",
  modulePathIgnorePatterns: ["e2e.spec.ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coveragePathIgnorePatterns: [
    "./utils/jest.config.ts",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
});
