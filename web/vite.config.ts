import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	publicDir: '../public',
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@shared': fileURLToPath(new URL('../shared', import.meta.url)),
			'@brain': fileURLToPath(new URL('../src', import.meta.url)),
			elysia: fileURLToPath(new URL('../node_modules/elysia', import.meta.url)),
		},
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		assetsDir: '_vite',
	},
})
