import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'



export default defineConfig({
  resolve: {
    alias: [
      { find: '~@', replacement: require('path').resolve(__dirname, 'src') },
      { find: '@', replacement: require('path').resolve(__dirname, 'src') },
      { find: '~', replacement:require('path').resolve(__dirname, 'node_modules') },
    ]
  },
  plugins: [createVuePlugin(),
  ],
});
