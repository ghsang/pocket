import eslintPluginAstro from 'eslint-plugin-astro';

// eslint-disable-next-line import/no-anonymous-default-export
export default [
	...eslintPluginAstro.configs['flat/all'],
	{
		rules: {},
	},
];
