import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslint from '@eslint/js';
import typescriptEslint from 'typescript-eslint';


const config = [
	eslint.configs.recommended,
	...typescriptEslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
	{
		rules: {
			"unicorn/prevent-abbreviations": "off",
			"unicorn/prefer-module": "off",
			"unicorn/filename-case": "off",
		},
		languageOptions: {
			globals: {
				process: "readonly",
			},
		},
	},
	{
		ignores: ['dev-dist/', '.vercel/', 'styled-system/', '*.cjs'],
	},
];

export default config;
