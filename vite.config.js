import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, ".")

  return {
    esbuild: {
      drop: ['console', 'debugger'], // 移除所有 console 和 debugger 语句
    },
    plugins: [
      vue(),
      vueDevTools(),
    ],
    base: './',
    server: {
      proxy: {
        '/api': {
          target: env.VITE_TARGET,
          // target: 'http://112.35.176.43:9900',
          //target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        },
        '/testApi': {
          //target: 'http://112.35.176.43:9900',
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/testApi/, ''),
        },
      },
      fs: {
        allow: ['..']
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
