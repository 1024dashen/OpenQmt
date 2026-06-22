import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const host = process.env.TAURI_DEV_HOST

export default defineConfig(async () => ({
    plugins: [vue()],
    clearScreen: false,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@root': path.resolve(__dirname, './'),
        },
    },
    server: {
        port: 1421,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: 'ws',
                  host,
                  port: 1421,
              }
            : undefined,
        watch: {
            ignored: ['**/src-tauri/**'],
        },
        proxy: {
            // 浏览器开发模式代理，避免基金排行 API 的 CORS 限制
            '/api/fund': {
                target:
                    process.env.VITE_FUND_RANK_BASE_URL ||
                    'https://condition.tiantianfunds.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/fund/, ''),
            },
            '/api/fund-detail': {
                target:
                    process.env.VITE_FUND_DETAIL_BASE_URL ||
                    'https://dgs.tiantianfunds.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api\/fund-detail/, ''),
            },
        },
    },
}))
