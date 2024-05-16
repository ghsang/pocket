import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';


const config = [
	...eslintPluginAstro.configs.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
	{
		rules: {
			// Override/add rules settings here, such as:
			// "astro/no-set-html-directive": "error"
		},
	},
	{
		ignores: ['dev-dist/', '.vercel/', 'styled-system/'],
	},
];

export default config;
