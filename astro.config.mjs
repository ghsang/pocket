/* eslint-disable new-cap */
/* eslint-disable camelcase */
import {defineConfig} from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import playformCompress from '@playform/compress';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel(),
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
		playformCompress(),
		AstroPWA({
			mode: 'production',
			base: '/',
			scope: '/',
			includeAssets: ['favicon.svg'],
			registerType: 'autoUpdate',
			manifest: {
				name: '가계부',
				short_name: '가계부',
				theme_color: '#ffffff',
				icons: [
					{
						src: 'icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				navigateFallback: '/',
				globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
			},
			devOptions: {
				enabled: true,
				navigateFallbackAllowlist: [/^\//],
			},
			experimental: {
				directoryAndTrailingSlashHandler: true,
			},
		}),
	],
});
