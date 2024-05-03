/* eslint-disable new-cap */
/* eslint-disable camelcase */
import {defineConfig} from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import AstroPWA from '@vite-pwa/astro';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
	vite: {
		logLevel: 'info',
		define: {
			__DATE__: `'${new Date().toISOString()}'`,
		},
		server: {
			fs: {
				allow: ['../..'],
			},
		},
	},
	integrations: [
		AstroPWA({
			base: '/',
			scope: '/',
			includeAssets: ['favicon.svg'],
			registerType: 'autoUpdate',
			manifest: {
				name: '가계부',
				short_name: '가계부',
				theme_color: '#ffffff',
				icons: [{
					src: 'icon-192x192.png',
					sizes: '192x192',
					type: 'image/png',
				}, {
					src: 'icon-512x512.png',
					sizes: '512x512',
					type: 'image/png',
				}, {
					src: 'icon-512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'any maskable',
				}],
			},
			workbox: {
				navigateFallback: '/',
				globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
			},
			experimental: {
				directoryAndTrailingSlashHandler: true,
			},
		}),
		auth(),
	],
});
