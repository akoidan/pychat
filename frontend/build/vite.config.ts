import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  getConsts,
  getGitRevision,
  readFileAsync
} from './utils';
import { resolve } from "path";

export default defineConfig(async ({command, mode}) => {
  let [key, cert, ca, gitHash] = await Promise.all([
    readFileAsync('./certs/private.key.pem'),
    readFileAsync('./certs/server.crt.pem'),
    readFileAsync('./certs/root.cr.pem'),
    getGitRevision()
  ]);
  const PYCHAT_CONSTS = getConsts(gitHash, command);
  return {
    resolve: {
      alias: [
        {find: '@', replacement: resolve(__dirname, '..', 'src')},
      ],
    },
    ...(PYCHAT_CONSTS.PUBLIC_PATH ? {base: PYCHAT_CONSTS.PUBLIC_PATH} : null),
    root: resolve(__dirname, '..','src'),
    plugins: [vue()],
    build: {
      minify: false,
      outDir: resolve(__dirname, '..','dist'),
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            let dirName = '';
            if (/\.(mp3|wav)$/.test(assetInfo.name)) {
              dirName = `sounds`;
            } else if (/emoji-datasource-apple/.test(assetInfo.name)) {
              dirName = `smileys`;
            } else if (/((fonts?\/.*\.svg)|(\.(woff2?|eot|ttf|otf)))(\?.*)?/.test(assetInfo.name)) {
              dirName = `font`;
            } else if (/assets\/flags\/.*\.png$/.test(assetInfo.name)) {
              dirName = `flags`;
            } else if (/assets\/img\/.*\.(png|jpg|svg|gif)$/.test(assetInfo.name)) {
              dirName = `img`;
            }else if (/cropperjs\/.*\.(png|jpg|svg|gif)$/.test(assetInfo.name)) {
              dirName = `img/cropperjs`;
            } else if (/\.css$/.test(assetInfo.name)){
              dirName = `css`;
            }
            return `${dirName}/[name]-[hash].[ext]`
          },
          chunkFileNames (assetInfo: any) {
            if (Object.keys(assetInfo.modules).find(a => a.indexOf('node_modules/spainter/') >= 0)) {
              return 'js/spainter-[hash].js'
            }
            return 'js/[name]-[hash].js';
          },
          entryFileNames: 'js/[name]-[hash].js',
        },
      },
    },
    server: {
      port: 8080,
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
