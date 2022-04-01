import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  getGitRevision,
  readFileAsync
} from './build/utils';
import { resolve } from "path";

export default defineConfig(async ({command, mode}) => {
  const PYCHAT_CONSTS = process.env.BUILD_MODE === 'PRODUCTION' ? require('./production.json') : require('./development.json');
  let [key, cert, ca, gitHash] = await Promise.all([
    readFileAsync('./certs/private.key.pem'),
    readFileAsync('./certs/server.crt.pem'),
    readFileAsync('./certs/root.cr.pem'),
    getGitRevision()
  ]);
  PYCHAT_CONSTS.GIT_HASH = gitHash;
  PYCHAT_CONSTS.IS_SSL = true;
  return {
    resolve: {
      alias: [
        {find: '@', replacement: resolve(__dirname, 'src')},
      ],
    },
    root: resolve(__dirname, 'src'),
    plugins: [vue()],
    server: {
      https: {
        key,
        cert,
        ca,
      },
    },
    define: {
      PYCHAT_CONSTS: JSON.stringify(PYCHAT_CONSTS)
    }
  }
});
