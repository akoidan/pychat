import type {Config} from "@jest/types";

// Sync object
// jest should be inside of src directory, otherwise tsc will compile it, and will make src directory in build
// which will fail node-ts-config along with __dirname for photos and etc
const config: Config.InitialOptions = {
  verbose: true,
};

export default async(): Promise<Config.InitialOptions> => ({
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
    "/node_modules/",
    "/coverage/",
    "/src/utils/jest.config.ts",
    "/dist/",
    ".module.ts$",
    ".dto.ts$",
  ],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
});
