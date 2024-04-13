import {defineConfig} from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import playformCompress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel(),
	integrations: [playformCompress()],
});
