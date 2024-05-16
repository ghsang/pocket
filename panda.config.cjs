const defineConfig = require('@pandacss/dev').defineConfig;

module.exports = defineConfig({
	preflight: true,
	// Define the content to scan 👇🏻
	include: ['./src/**/*.{ts,tsx,js,jsx,astro}', './pages/**/*.{ts,tsx,js,jsx,astro}'],
	exclude: [],
	outdir: 'styled-system',
	theme: {
		extend: {
			keyframes: {
				newItem: {
					from: {backgroundColor: 'lime.200'},
				},
				slideFromBottom: {
					from: {
						transform: 'translateY(100%)',
					},
					to: {
						transform: 'translateY(0)',
					},
				},
				opacity: {
					from: {
						opacity: 0,
					},
				},
			},
		},
	},
});
