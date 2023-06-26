import {
  defineConfig,
  splitVendorChunkPlugin,
} from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  getConsts,
  getGitRevision,
  readFileAsync,
} from './utils';
import {resolve} from "path";
import {outputManifest} from './sw.plugin';
import {OutputChunk} from 'rollup';
import viteChecker from 'vite-plugin-checker'
import {viteStaticCopy} from 'vite-plugin-static-copy'
import viteCompression from 'vite-plugin-compression'
import viteVisualizer from 'rollup-plugin-visualizer'

export default defineConfig(async({command, mode}) => {
  let key, cert, ca, gitHash;
  if (command === 'serve') {
    [key, cert, ca, gitHash] = await Promise.all([
      readFileAsync('./build/certs/private.key.pem'),
      readFileAsync('./build/certs/server.crt.pem'),
      readFileAsync('./build/certs/root.cr.pem'),
      getGitRevision()
    ]);
  } else {
    gitHash = await getGitRevision();
  }

  const PYCHAT_CONSTS = getConsts(gitHash, command);
  const srcDir = resolve(__dirname, '..', 'src');
  const distDir = resolve(__dirname, '..', 'dist');
  const nodeModulesDir = resolve(__dirname, '..', 'node_modules');
  const swFilePath = resolve(srcDir, 'ts', 'sw.ts');
  const smileyPath = resolve(srcDir, 'assets', 'smileys.json');
  return {
    resolve: {
      alias: [
        {find: '@', replacement: srcDir},
      ],
    },
    ...(PYCHAT_CONSTS.PUBLIC_PATH ? {base: PYCHAT_CONSTS.PUBLIC_PATH} : null),
    root: srcDir,
    css: {
      devSourcemap: true,
    },
    plugins: [
      vue(),
      ...(!process.env.VITE_LIGHT ? [
        viteChecker({
            typescript: !process.env.VITE_LIGHT,
            vueTsc: !process.env.VITE_LIGHT,
            ...(process.env.VITE_LINT ? {
              eslint: {
                lintCommand: 'eslint --ext .vue --ext .ts ts vue',
                dev: {}
              }
            } : null)
          }
        ),
        viteCompression({
          filter: () => true,
        }),
      ] : []),
      splitVendorChunkPlugin(),
      outputManifest({swFilePath}),
      viteStaticCopy({
        targets: [
          {
            src: `${resolve(nodeModulesDir, 'emoji-datasource-apple/img/apple/64')}/*`,
            dest: 'smileys'
          },
          {
            src: smileyPath,
            dest: 'smileys'
          }
        ]
      })
    ],
    build: {
      emptyOutDir: true,
      assetsInlineLimit: 0,
      minify: !PYCHAT_CONSTS.IS_DEBUG,
      outDir: distDir,
      sourcemap: true,
      rollupOptions: {
        plugins: [
          viteVisualizer({
            filename: resolve(__dirname, 'stats.html'),
          })
        ],
        input: {
          index: resolve(srcDir, 'index.html'), //index should be inside src, otherwise vite won't return it by default
          sw: swFilePath,
        },
        output: {
          assetFileNames: (assetInfo) => {
            let dirName = '';
            if (/\.(mp3|wav)$/.test(assetInfo.name!)) {
              dirName = `sounds/`;
            } else if (/\/assets\/flags/.test(assetInfo.name!)) {
              dirName = `flags/`;
            } else if (/((fonts?\/.*\.svg)|(\.(woff2?|eot|ttf|otf)))(\?.*)?/.test(assetInfo.name!)) {
              dirName = `font/`;
            } else if (/assets\/flags\/.*\.png$/.test(assetInfo.name!)) {
              dirName = `flags/`;
            } else if (/\.(png|jpg|svg|gif|ico)$/.test(assetInfo.name!)) {
              dirName = `img/`;
            } else if (/\.css$/.test(assetInfo.name!)) {
              dirName = `css/`;
            }
            return `${dirName}[name]-[hash].[ext]`
          },
          chunkFileNames(assetInfo: OutputChunk) {
            if (Object.keys(assetInfo.modules).find(a => a.indexOf('node_modules/spainter/') >= 0)) {
              return 'js/spainter-[hash].js'
            }
            if (assetInfo?.facadeModuleId && assetInfo.facadeModuleId.indexOf('node_modules/highlight.js') >= 0) {
              return 'js/highlightjs-[hash].js'
            }
            return 'js/[name]-[hash].js';
          },
          entryFileNames(assetInfo: OutputChunk) {
            if (assetInfo.facadeModuleId == swFilePath) {
              return 'sw.js';
            } else {
              return 'js/[name]-[hash].js';
            }
          },
        },
      },
    },
    server: {
      host: true,
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
